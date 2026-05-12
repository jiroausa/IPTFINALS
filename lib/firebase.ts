// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjOjfChR66pnnIyh0J0uGDNjIICl3BUuk",
  authDomain: "adv102-82510.firebaseapp.com",
  projectId: "adv102-82510",
  storageBucket: "adv102-82510.firebasestorage.app",
  messagingSenderId: "491050076341",
  appId: "1:491050076341:web:8a26c647fac63b3dbad6fc",
  measurementId: "G-4RY08YTXPE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);