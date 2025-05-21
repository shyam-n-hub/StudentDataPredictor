// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAos73fgKpnakhuiWNCPj2vQtHw2uSNGLA",
  authDomain: "studentdatapredictor-3448b.firebaseapp.com",
  projectId: "studentdatapredictor-3448b",
  storageBucket: "studentdatapredictor-3448b.firebasestorage.app",
  messagingSenderId: "1023012262855",
  appId: "1:1023012262855:web:478bf73bfcb5dd336effe2",
  measurementId: "G-ZRYEF22C5G"
};
  
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Set persistence to LOCAL (survives browser restarts)
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Firebase persistence error:", error);
  });