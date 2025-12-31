// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5fytwjnFeftggLCFkRHFiABo8xQ6C3mk",
  authDomain: "codeai-b5c41.firebaseapp.com",
  projectId: "codeai-b5c41",
  storageBucket: "codeai-b5c41.firebasestorage.app",
  messagingSenderId: "76007945756",
  appId: "1:76007945756:web:a84da596189558f48451d9"
};

// Init Firebase
export const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const db = getFirestore(app);
