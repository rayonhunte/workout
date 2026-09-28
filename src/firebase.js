// src/firebase.js
// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  connectAuthEmulator,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcCImlV-OXkNf3susLNEwC393Dv7p34Qs",
  authDomain: "allwork-e32b6.firebaseapp.com",
  projectId: "allwork-e32b6",
  storageBucket: "allwork-e32b6.firebasestorage.app",
  messagingSenderId: "573646578901",
  appId: "1:573646578901:web:a8a580414338e45f3a2e5c",
  measurementId: "G-EK29MQ7SB0",
};

// Initialize Firebase
const app = initializeApp(
  import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true"
    ? { ...firebaseConfig, projectId: "demo-workout", apiKey: "demo-key" }
    : firebaseConfig,
);
// Health and workout screens do not initialize analytics.
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Configure provider to use popup (explicit) and set redirect URI
provider.setCustomParameters({
  prompt: "select_account",
});
// Ensure we're using popup mode explicitly
auth.languageCode = "en";

const db = getFirestore(app);

// Development-only emulators use a demo project and never contact production data.
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
export { app, auth, provider, db };
