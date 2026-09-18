// ============================================================
// SCHOOL INFORMATION - Flying Colours Schooling System Moro
// ============================================================
export const COLLEGE_INFO = {
    name: 'Flying Colours Schooling System Moro',
    shortName: 'FCS Moro',
    location: 'Moro, Sindh',
    currentSession: '2026',
    firebaseProject: 'creative-minds-school-sakrand'
};

// ============================================================
// TEACHERS LIST (Demo Users) - ONLY ONE TIME
// ============================================================
export const EXAM_STUDENTS = [
    { name: 'DEMO USER 1', username: 'demo1', password: 'demo1' },
    { name: 'DEMO USER 2', username: 'demo2', password: 'demo2' },
    { name: 'DEMO USER 3', username: 'demo3', password: 'demo3' },
    { name: 'DEMO USER 4', username: 'demo4', password: 'demo4' },
    { name: 'DEMO USER 5', username: 'demo5', password: 'demo5' },
    { name: 'DEMO USER 6', username: 'demo6', password: 'demo6' },
    { name: 'DEMO USER 7', username: 'demo7', password: 'demo7' },
    { name: 'DEMO USER 8', username: 'demo8', password: 'demo8' },
    { name: 'DEMO USER 9', username: 'demo9', password: 'demo9' },
    { name: 'DEMO USER 10', username: 'demo10', password: 'demo10' },
    { name: 'DEMO USER 11', username: 'demo11', password: 'demo11' },
    { name: 'DEMO USER 12', username: 'demo12', password: 'demo12' },
    { name: 'DEMO USER 13', username: 'demo13', password: 'demo13' },
    { name: 'DEMO USER 14', username: 'demo14', password: 'demo14' },
    { name: 'DEMO USER 15', username: 'demo15', password: 'demo15' },
    { name: 'DEMO USER 16', username: 'demo16', password: 'demo16' },
    { name: 'DEMO USER 17', username: 'demo17', password: 'demo17' },
    { name: 'DEMO USER 18', username: 'demo18', password: 'demo18' },
    { name: 'DEMO USER 19', username: 'demo19', password: 'demo19' },
    { name: 'DEMO USER 20', username: 'demo20', password: 'demo20' }
];

// ============================================================
// INTERVIEW QUESTIONS - 30 Questions
// ============================================================
export const INTERVIEW_QUESTIONS = [
    { id: 1, question: "Introduce yourself briefly?" },
    { id: 2, question: "What are your strengths as a teacher?" },
    { id: 3, question: "What is your biggest weakness?" },
    { id: 4, question: "Why do you want to join Flying Colours Schooling System?" },
    { id: 5, question: "What qualities make a good teacher?" },
    { id: 6, question: "How do you motivate weak students?" },
    { id: 7, question: "How do you maintain classroom discipline?" },
    { id: 8, question: "How do you handle student misbehavior?" },
    { id: 9, question: "How do you make your lessons interesting?" },
    { id: 10, question: "How do you assess students' learning?" },
    { id: 11, question: "How do you communicate with parents?" },
    { id: 12, question: "How do you handle parents' complaints?" },
    { id: 13, question: "How do you support slow learners?" },
    { id: 14, question: "How do you encourage shy students to participate?" },
    { id: 15, question: "How do you plan your daily lessons?" },
    { id: 16, question: "How do you manage your time at school?" },
    { id: 17, question: "How do you maintain professionalism?" },
    { id: 18, question: "How do you work as part of a team?" },
    { id: 19, question: "How would you handle a disagreement with a colleague?" },
    { id: 20, question: "Are you willing to take extra responsibilities?" },
    { id: 21, question: "How do you keep yourself updated with modern teaching methods?" },
    { id: 22, question: "Which teaching method do you use most and why?" },
    { id: 23, question: "How do you encourage creativity in students?" },
    { id: 24, question: "What would you do if a student is frequently absent?" },
    { id: 25, question: "How do you appreciate students' achievements?" },
    { id: 26, question: "What role does moral education play in school?" },
    { id: 27, question: "What new ideas can you bring to our school?" },
    { id: 28, question: "How do you manage stress at work?" },
    { id: 29, question: "What are your career goals?" },
    { id: 30, question: "Why should we trust you with our students?" }
];

// ============================================================
// INTERVIEW CONFIG
// ============================================================
export const INTERVIEW_CONFIG = {
    id: 'interview',
    name: 'Teacher Interview',
    description: '30 Interview Questions for Teaching Position',
    totalQuestions: 30,
    timeLimit: 60,
    passingScore: 50
};

// ============================================================
// EXPORTS
// ============================================================
export const EXAM_QUESTIONS = INTERVIEW_QUESTIONS;
export const CURRENT_TEST = INTERVIEW_CONFIG;
export const ACTIVE_TEST_ID = 'test1';
export const ALL_TESTS = {
    test1: {
        id: 'test1',
        name: 'Teacher Interview',
        description: '30 Interview Questions',
        totalQuestions: 30,
        timeLimit: 60,
        passingScore: 50,
        questions: INTERVIEW_QUESTIONS
    }
};

console.log('🏫 Flying Colours Schooling System Moro');
console.log('📝 Total Teachers:', EXAM_STUDENTS.length);
