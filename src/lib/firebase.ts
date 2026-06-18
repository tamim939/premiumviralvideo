import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDhPWB3lDnu-nLGLlROOeYXcPPOILjf8a8",
  authDomain: "win333-c2cee.firebaseapp.com",
  databaseURL: "https://win333-c2cee-default-rtdb.firebaseio.com",
  projectId: "win333-c2cee",
  storageBucket: "win333-c2cee.firebasestorage.app",
  messagingSenderId: "67795790100",
  appId: "1:67795790100:web:87327547cca54fa61c3a01",
  measurementId: "G-WBLWTKLRPY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
