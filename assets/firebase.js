// ============================================================
// FIREBASE CONFIG - Creative Minds School Sakrand
// ============================================================

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCHlwZ7N19QT6UfBIrCxqF9gYqMmX70etE",
    authDomain: "creative-minds-school-sakrand.firebaseapp.com",
    projectId: "creative-minds-school-sakrand",
    storageBucket: "creative-minds-school-sakrand.firebasestorage.app",
    messagingSenderId: "1052341716424",
    appId: "1:1052341716424:web:b7b26fdc74b688ff4c2cfd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('✅ Creative Minds School - Connected');
console.log('🏫 Sakrand, Sindh');

export { app, db };