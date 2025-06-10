import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, signInWithCredential } from "firebase/auth";
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnWgEXuqyRUEmcVNk5IiEpTLyaJpyt7VQ",
  authDomain: "humsoul-27d0f.firebaseapp.com",
  projectId: "humsoul-27d0f",
  storageBucket: "humsoul-27d0f.appspot.com", // fix this (you had wrong domain earlier)
  messagingSenderId: "367237349555",
  appId: "1:367237349555:web:0a8a1643ef90a1a391f0c6",
  measurementId: "G-H5N3K457WF"
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
