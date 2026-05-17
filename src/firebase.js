import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBHGpJ6HFfP0pLKpn9eqb5ZYR1KL9odwwU",
  authDomain: "camping-checklist-a3746.firebaseapp.com",
  databaseURL: "https://camping-checklist-a3746-default-rtdb.firebaseio.com",
  projectId: "camping-checklist-a3746",
  storageBucket: "camping-checklist-a3746.firebasestorage.app",
  messagingSenderId: "40031700420",
  appId: "1:40031700420:web:628cf80458f0b7229e9091",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
