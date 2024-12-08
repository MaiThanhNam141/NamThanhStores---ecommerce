import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAlYmoqbIkEjR0eGUIYWHrZU9Pv7GLALxU",
  authDomain: "namthanhstores.firebaseapp.com",
  databaseURL: "https://namthanhstores-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "namthanhstores",
  storageBucket: "namthanhstores.appspot.com",
  messagingSenderId: "140469949329",
  appId: "1:140469949329:web:23d5ad3c53fd1c079ec030",
  measurementId: "G-KJCE6QXGY9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDatabase = getDatabase(app);

export { auth, db, realtimeDatabase }