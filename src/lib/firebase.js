// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuOFVgSisq8QL3BhikhsB6ih8-SYaxnJQ",
  authDomain: "reaktorbirdnest.firebaseapp.com",
  projectId: "reaktorbirdnest",
  storageBucket: "reaktorbirdnest.appspot.com",
  messagingSenderId: "402102340569",
  appId: "1:402102340569:web:fa4fefd3020387ba1d67c8"
};

// Initialize Firebase services
export const app = initializeApp(firebaseConfig);
export const functions = getFunctions(app, "europe-west1");
export const db = getFirestore(app);

//connect emulators
if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, "localhost", 5001);
}
