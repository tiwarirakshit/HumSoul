import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, signInWithCredential } from "firebase/auth";
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// IMPORTANT: Make sure google-services.json is present in android/app/ for Firebase Auth and Google Sign-In to work on Android.

// Firebase configuration for humsoul-spare project
const firebaseConfig = {
  apiKey: "AIzaSyCSTSf-g7crDqYZ7YNqlpAklxtORGGAEZ4",
  authDomain: "humsoul-spare.firebaseapp.com",
  projectId: "humsoul-spare",
  storageBucket: "humsoul-spare.firebasestorage.app",
  messagingSenderId: "919451172750",
  appId: "1:919451172750:android:c81c05964d7a9335836edf",
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
      console.log('Attempting Google Sign-In on native platform');
      const result = await GoogleAuth.signIn();
      console.log('GoogleAuth.signIn result:', result);
      
      if (!result || !result.authentication || !result.authentication.idToken) {
        console.error('Google sign-in failed: Invalid result structure:', result);
        throw new Error('Google sign-in failed: No idToken returned from native GoogleAuth plugin.');
      }
      
      console.log('Creating Firebase credential with idToken');
      const credential = GoogleAuthProvider.credential(result.authentication.idToken);
      console.log('Signing in to Firebase with credential');
      return signInWithCredential(auth, credential);
    } else {
      // For web platforms
      console.log('Attempting Google Sign-In on web platform');
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      return signInWithPopup(auth, googleProvider);
    }
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('adminUser');
    window.location.href = '/';
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
