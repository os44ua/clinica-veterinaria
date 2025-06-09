import { getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDpHe9FVlip8nFQefnnhY5a5W5lPzFloYM",
  authDomain: "clinica-veterinaria-fe824.firebaseapp.com",
  databaseURL: "https://clinica-veterinaria-fe824-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "clinica-veterinaria-fe824",
  storageBucket: "clinica-veterinaria-fe824.firebasestorage.app",
  messagingSenderId: "148228524919",
  appId: "1:148228524919:web:5f475bb25e96f91b106f72",
  measurementId: "G-C5GVX4WSFG"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getDatabase(app);



