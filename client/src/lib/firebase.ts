import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, signInWithCredential } from "firebase/auth";
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNz34Vyr-kU2tiTKQDZi70MYDQqk4SEBY",
  authDomain: "humsoul-8ac3c.firebaseapp.com",
  projectId: "humsoul-8ac3c",
  storageBucket: "humsoul-8ac3c.firebasestorage.app",
  messagingSenderId: "676589244801",
  appId: "1:676589244801:web:54f2cdff0c9da945add880",
  measurementId: "G-KGYP02QBVR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      // For mobile platforms
      const result = await GoogleAuth.signIn();
      const credential = GoogleAuthProvider.credential(result.authentication.idToken);
      return signInWithCredential(auth, credential);
    } else {
      // For web platforms
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      return signInWithPopup(auth, googleProvider);
    }
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };
