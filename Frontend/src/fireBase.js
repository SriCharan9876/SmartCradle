// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBo7ZeThNzkcxGkTUZPb3Hd-nDIQfKj-DU",
  authDomain: "smart-cradle-fbb4a.firebaseapp.com",
  databaseURL: "https://smart-cradle-fbb4a-default-rtdb.firebaseio.com",
  projectId: "smart-cradle-fbb4a",
  storageBucket: "smart-cradle-fbb4a.firebasestorage.app",
  messagingSenderId: "689778977856",
  appId: "1:689778977856:web:993452f14aa5437e9703a5",
  measurementId: "G-L8XB4GMKN1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Services you need
export const auth = getAuth(app);
export const db = getDatabase(app);
// Google Provider
export const googleProvider = new GoogleAuthProvider();