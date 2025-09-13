// src/firebase.js
// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcCImlV-OXkNf3susLNEwC393Dv7p34Qs",
  authDomain: "allwork-e32b6.firebaseapp.com",
  projectId: "allwork-e32b6",
  storageBucket: "allwork-e32b6.firebasestorage.app",
  messagingSenderId: "573646578901",
  appId: "1:573646578901:web:a8a580414338e45f3a2e5c",
  measurementId: "G-EK29MQ7SB0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, analytics, auth, provider, db };