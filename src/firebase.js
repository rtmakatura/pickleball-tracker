// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQOSJjMJvJHPykg5U85blJngBZPSQ3wgs",
  authDomain: "pickleball-tracker-d63cf.firebaseapp.com",
  projectId: "pickleball-tracker-d63cf",
  storageBucket: "pickleball-tracker-d63cf.firebasestorage.app",
  messagingSenderId: "288756510816",
  appId: "1:288756510816:web:d2284bbf82de842d629305"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
