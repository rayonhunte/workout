import React from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

export default function GoogleSignInButton({ onSignIn }) {
  const handleSignIn = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Clear any hash that might interfere with popup
      const currentHash = window.location.hash;
      if (currentHash && !currentHash.includes('__')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      
      const result = await signInWithPopup(auth, provider);
      if (onSignIn) onSignIn(result.user);
      
      // Clear any auth-related hash fragments after successful sign-in
      setTimeout(() => {
        const hash = window.location.hash;
        if (hash && (hash.includes('access_token') || hash.includes('id_token') || hash.includes('authuser'))) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }, 100);
    } catch (error) {
      // Handle specific error codes
      if (error.code === 'auth/popup-blocked') {
        alert('Popup was blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup - don't show error, just return
        return;
      } else {
        alert("Sign in failed: " + error.message);
      }
      console.error('Sign in error:', error);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label="Sign in with Google"
    >
      <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path d="M44.5 20H24V28.5H36.5C35.1 32.6 31.1 35.5 26.5 35.5C20.7 35.5 16 30.8 16 25C16 19.2 20.7 14.5 26.5 14.5C29.1 14.5 31.4 15.5 33.1 17.1L38.1 12.1C34.9 9.1 30.9 7 26.5 7C16.8 7 9 14.8 9 24.5C9 34.2 16.8 42 26.5 42C35.2 42 43 34.2 43 24.5C43 23.3 42.9 22.2 42.7 21.1L44.5 20Z" fill="#4285F4"/>
          <path d="M6.3 14.1L12.1 18.6C13.7 15.2 16.8 12.7 20.7 12.1C22.2 11.9 23.7 11.9 25.2 12.1V7.1C22.7 6.7 20.1 6.7 17.6 7.1C12.7 7.8 8.5 11.2 6.3 14.1Z" fill="#34A853"/>
          <path d="M25.2 42.1V37.1C23.7 37.3 22.2 37.3 20.7 37.1C16.8 36.5 13.7 34 12.1 30.6L6.3 35.1C8.5 38 12.7 41.4 17.6 42.1C20.1 42.5 22.7 42.5 25.2 42.1Z" fill="#FBBC05"/>
          <path d="M42.7 21.1C43.1 22.7 43.3 24.3 43.3 25.9C43.3 27.5 43.1 29.1 42.7 30.7L37.1 26.2C36.7 25.7 36.5 25.1 36.5 24.5C36.5 23.9 36.7 23.3 37.1 22.8L42.7 21.1Z" fill="#EA4335"/>
        </g>
      </svg>
      Sign in with Google
    </button>
  );
}
