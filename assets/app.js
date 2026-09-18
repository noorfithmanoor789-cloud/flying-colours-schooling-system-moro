import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { 
    EXAM_STUDENTS, 
    EXAM_QUESTIONS, 
    CURRENT_TEST, 
    ACTIVE_TEST_ID, 
    ALL_TESTS,
    COLLEGE_INFO 
} from './data.js';

// ==================== STATE MANAGEMENT ====================
let currentUser = null;
let currentQuestionIndex = 0;
let userAnswers = new Array(EXAM_QUESTIONS.length).fill('');
let timer = null;
let timeLeft = CURRENT_TEST.timeLimit * 60;
let examStartTime = null;
let examEndTime = null;
let examSubmitted = false;

// ==================== DOM REFERENCES ====================
const loginSection = document.getElementById('loginSection');
const instructionsSection = document.getElementById('instructionsSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const startExamBtn = document.getElementById('startExamBtn');

// ==================== UPDATE INSTRUCTIONS ====================
function updateInstructions() {
    const testInfo = document.getElementById('testInfo');
    if (testInfo) {
        testInfo.innerHTML = `
            <strong>🏫 ${COLLEGE_INFO.name}</strong><br>
            <strong>📝 Interview:</strong> ${CURRENT_TEST.name} 
            | <strong>Questions:</strong> ${CURRENT_TEST.totalQuestions} 
            | <strong>Time:</strong> ${CURRENT_TEST.timeLimit} minutes
        `;
    }
    
    const totalQuestionsDisplay = document.getElementById('totalQuestionsDisplay');
    if (totalQuestionsDisplay) {
        totalQuestionsDisplay.textContent = CURRENT_TEST.totalQuestions;
    }
    
    const timeLimitDisplay = document.getElementById('timeLimitDisplay');
    if (timeLimitDisplay) {
        timeLimitDisplay.textContent = CURRENT_TEST.timeLimit;
    }
}

// ==================== LOGIN FUNCTION ====================
if (loginForm) {
    console.log('✅ Login form found');
    console.log('📋 Total Students:', EXAM_STUDENTS.length);
    console.log('📋 First Student:', EXAM_STUDENTS[0]);
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('🔐 Login attempt started');
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        console.log('👤 Username entered:', username);
        console.log('🔑 Password entered:', password);

        // Admin Login
        if (username === 'admin' && password === 'admin123') {
            console.log('✅ Admin login successful');
            window.location.href = 'admin/dashboard.html';
            return;
        }

        // Teacher Login
        const teacher = EXAM_STUDENTS.find(s => s.username === username && s.password === password);
        console.log('🔍 Teacher found:', teacher);

        if (teacher) {
            currentUser = teacher;
            localStorage.setItem('examUser', JSON.stringify(teacher));
            
            if (loginSection) loginSection.style.display = 'none';
            if (instructionsSection) instructionsSection.style.display = 'block';
            if (loginError) loginError.style.display = 'none';
            
            const welcomeMsg = document.getElementById('welcomeMessage');
            if (welcomeMsg) {
                welcomeMsg.textContent = `Welcome, ${teacher.name}!`;
            }
            
            updateInstructions();
            console.log('✅ Teacher login successful');
        } else {
            if (loginError) {
                loginError.textContent = 'Invalid username or password. Please try again.';
                loginError.style.display = 'block';
            }
            console.log('❌ Invalid credentials');
        }
    });
} else {
    console.log('❌ Login form NOT found');
}

// ==================== START INTERVIEW ====================
if (startExamBtn) {
    startExamBtn.addEventListener('click', () => {
        localStorage.setItem('examStarted', 'true');
        window.location.href = 'student/test.html';
    });
}

// ==================== INTERVIEW LOGIC ====================
if (window.location.pathname.includes('test.html')) {
    const userData = JSON.parse(localStorage.getItem('examUser'));
    if (!userData) {
        window.location.href = '../index.html';
    }

    currentUser = userData;
    document.getElementById('studentNameDisplay').textContent = currentUser.name;
    document.getElementById('totalQNum').textContent = EXAM_QUESTIONS.length;
    document.getElementById('testNameDisplay').textContent = CURRENT_TEST.name;

    displayQuestion(0);
    startTimer();

    document.getElementById('prevBtn')?.addEventListener('click', () => navigateQuestion(-1));
    document.getElementById('nextBtn')?.addEventListener('click', () => navigateQuestion(1));
    document.getElementById('submitBtn')?.addEventListener('click', submitExam);
}

function displayQuestion(index) {
    if (index < 0 || index >= EXAM_QUESTIONS.length) return;

    const question = EXAM_QUESTIONS[index];
    document.getElementById('currentQNum').textContent = index + 1;
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('progressFill').style.width = `${((index + 1) / EXAM_QUESTIONS.length) * 100}%`;

    const answerContainer = document.getElementById('answerContainer');
    answerContainer.innerHTML = `
        <div style="margin-top:15px;">
            <label style="font-weight:600; color:#0a3d6b; display:block; margin-bottom:8px;">Your Answer:</label>
            <textarea id="answerText" rows="6" placeholder="Write your answer here..." 
                style="width:100%; padding:12px; border:2px solid #dce3ef; border-radius:10px; font-size:1rem; font-family:inherit; resize:vertical;">${userAnswers[index] || ''}</textarea>
            <div style="margin-top:5px; font-size:0.85rem; color:#6c757d;">
                💡 <span id="charCount">${userAnswers[index] ? userAnswers[index].length : 0}</span> characters
            </div>
        </div>
    `;

    const textarea = document.getElementById('answerText');
    if (textarea) {
        textarea.addEventListener('input', function() {
            userAnswers[index] = this.value;
            document.getElementById('charCount').textContent = this.value.length;
        });
    }

    currentQuestionIndex = index;
    updateButtons();
}

function navigateQuestion(direction) {
    const newIndex = currentQuestionIndex + direction;
    if (newIndex >= 0 && newIndex < EXAM_QUESTIONS.length) {
        displayQuestion(newIndex);
    }
}

function updateButtons() {
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').disabled = currentQuestionIndex === EXAM_QUESTIONS.length - 1;
}

function startTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    examStartTime = new Date();

    timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Time is up! Your interview will be submitted automatically.');
            submitExam();
        }
    }, 1000);
}

// ==================== SUBMIT INTERVIEW ====================
async function submitExam() {
    if (examSubmitted) return;
    
    const unanswered = userAnswers.filter(a => a.trim() === '').length;
    if (unanswered > 0) {
        if (!confirm(`You have ${unanswered} unanswered questions. Are you sure you want to submit?`)) {
            return;
        }
    }

    examSubmitted = true;
    clearInterval(timer);
    examEndTime = new Date();
    const timeTaken = Math.floor((examEndTime - examStartTime) / 1000);

    let answered = 0;
    userAnswers.forEach(answer => {
        if (answer.trim().length >= 10) {
            answered++;
        }
    });

    const total = EXAM_QUESTIONS.length;
    const percentage = ((answered / total) * 100).toFixed(2);
    const passFail = parseFloat(percentage) >= 50 ? 'Pass' : 'Fail';

    const resultData = {
        teacherName: currentUser.name,
        username: currentUser.username,
        interviewName: CURRENT_TEST.name,
        answers: userAnswers,
        answeredQuestions: answered,
        totalQuestions: total,
        percentage: parseFloat(percentage),
        passFail: passFail,
        examDate: new Date().toLocaleDateString(),
        timeTaken: timeTaken,
        submittedAt: new Date().toISOString(),
        school: COLLEGE_INFO.name
    };

    localStorage.setItem('examResult', JSON.stringify(resultData));

    try {
        await saveResult(resultData);
        alert('✅ Interview Results Saved Successfully!');
        window.location.href = 'result.html';
    } catch (error) {
        console.error('Error saving result:', error);
        alert('⚠️ Error saving result. Your answers are still available.');
        window.location.href = 'result.html';
    }
}

// ==================== FIREBASE FUNCTIONS ====================
async function saveResult(resultData) {
    try {
        const docRef = await addDoc(collection(db, 'interview-results'), {
            ...resultData,
            submittedAt: serverTimestamp()
        });
        console.log('✅ Result saved with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Firebase save error:', error);
        throw error;
    }
}

async function getAllResults() {
    try {
        const q = query(collection(db, 'interview-results'), orderBy('submittedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
        });
        return results;
    } catch (error) {
        console.error('Error fetching results:', error);
        return [];
    }
}

// ==================== RESULT PAGE ====================
if (window.location.pathname.includes('result.html')) {
    const resultData = JSON.parse(localStorage.getItem('examResult'));
    if (!resultData) {
        window.location.href = '../index.html';
    }

    const resultContainer = document.getElementById('resultContent');
    
    let answersHTML = '';
    if (resultData.answers) {
        resultData.answers.forEach((answer, index) => {
            const status = answer.trim().length >= 10 ? '✅' : '❌';
            answersHTML += `
                <div style="padding:10px; margin:8px 0; background:${answer.trim().length >= 10 ? '#d4edda' : '#f8d7da'}; border-radius:8px; text-align:left;">
                    <strong>Q${index + 1}:</strong> ${answer || 'No answer provided'} ${status}
                </div>
            `;
        });
    }

    resultContainer.innerHTML = `
        <h2>📊 Interview Results</h2>
        <div style="background:#e8f4fd; padding:12px; border-radius:10px; margin-bottom:15px;">
            <p style="margin:0; font-weight:bold; color:#0a3d6b;">🏫 ${resultData.school || 'Flying Colours Schooling System'}</p>
        </div>
        <div class="result-item">
            <span class="label">Teacher Name:</span>
            <span class="value">${resultData.teacherName}</span>
        </div>
        <div class="result-item">
            <span class="label">Username:</span>
            <span class="value">${resultData.username}</span>
        </div>
        <div class="result-item">
            <span class="label">Questions Answered:</span>
            <span class="value">${resultData.answeredQuestions || 0} / ${resultData.totalQuestions || 30}</span>
        </div>
        <div class="result-item">
            <span class="label">Score:</span>
            <span class="value">${resultData.percentage || 0}%</span>
        </div>
        <div class="result-item">
            <span class="label">Status:</span>
            <span class="value ${resultData.passFail === 'Pass' ? 'pass' : 'fail'}">
                ${resultData.passFail === 'Pass' ? '✅ SELECTED' : '❌ NOT SELECTED'}
            </span>
        </div>
        <div class="result-item">
            <span class="label">Time Taken:</span>
            <span class="value">${Math.floor(resultData.timeTaken / 60)}m ${resultData.timeTaken % 60}s</span>
        </div>
        <div class="result-item">
            <span class="label">Date:</span>
            <span class="value">${resultData.examDate}</span>
        </div>
        <div style="margin-top:20px; text-align:left;">
            <h3>📝 Your Answers:</h3>
            <div style="max-height:400px; overflow-y:auto; padding:10px; background:#f8f9fa; border-radius:10px;">
                ${answersHTML}
            </div>
        </div>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../index.html';
    });
}

// ==================== ADMIN DASHBOARD ====================
if (window.location.pathname.includes('dashboard.html')) {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
        const password = prompt('Enter admin password:');
        if (password === 'admin123') {
            localStorage.setItem('adminLoggedIn', 'true');
        } else {
            alert('Invalid admin password!');
            window.location.href = '../index.html';
        }
    }

    loadResults();

    document.getElementById('refreshBtn')?.addEventListener('click', loadResults);
    document.getElementById('searchInput')?.addEventListener('input', filterResults);
    document.getElementById('sortSelect')?.addEventListener('change', sortResults);
    document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = '../index.html';
    });
}

let allResults = [];

async function loadResults() {
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '<tr><td colspan="8">Loading interviews...</td></tr>';

    try {
        allResults = await getAllResults();
        displayResults(allResults);
        
        document.getElementById('resultCount').innerHTML = `📊 Total Interviews: <strong>${allResults.length}</strong>`;
        document.getElementById('totalTeachers').textContent = EXAM_STUDENTS.length;
        document.getElementById('totalResults').textContent = allResults.length;
        document.getElementById('passCount').textContent = allResults.filter(r => r.passFail === 'Pass').length;
        document.getElementById('failCount').textContent = allResults.filter(r => r.passFail === 'Fail').length;
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="8">Error loading results</td></tr>';
        console.error(error);
    }
}

function displayResults(results) {
    const tbody = document.getElementById('resultsBody');
    if (results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px;">No interviews found</td></tr>';
        return;
    }

    tbody.innerHTML = results.map((result, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${result.teacherName || 'N/A'}</td>
            <td>${result.username || 'N/A'}</td>
            <td>${result.answeredQuestions || 0}/${result.totalQuestions || 30}</td>
            <td>${result.percentage || 0}%</td>
            <td>
                <span class="status-badge ${result.passFail === 'Pass' ? 'status-pass' : 'status-fail'}">
                    ${result.passFail || 'N/A'}
                </span>
            </td>
            <td>${result.examDate || 'N/A'}</td>
            <td>${result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : 'N/A'}</td>
        </tr>
    `).join('');
}

function filterResults() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allResults.filter(r => 
        (r.teacherName?.toLowerCase().includes(searchTerm) || 
         r.username?.toLowerCase().includes(searchTerm))
    );
    displayResults(filtered);
}

function sortResults() {
    const sortType = document.getElementById('sortSelect').value;
    let sorted = [...allResults];

    switch(sortType) {
        case 'highest':
            sorted.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
            break;
        case 'lowest':
            sorted.sort((a, b) => (a.percentage || 0) - (b.percentage || 0));
            break;
        case 'latest':
            sorted.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
            break;
    }

    displayResults(sorted);
}

if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
    const userData = JSON.parse(localStorage.getItem('examUser'));
    const examStarted = localStorage.getItem('examStarted');
    
    if (userData && examStarted === 'true') {
        window.location.href = 'student/test.html';
    }
}

export { saveResult, getAllResults };
