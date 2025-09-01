import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDtheRfY6rwj_NmS3fhlCesAnomqhZMsKE",
  authDomain: "trading-simulator-aaec2.firebaseapp.com",
  projectId: "trading-simulator-aaec2",
  storageBucket: "trading-simulator-aaec2.appspot.com",
  messagingSenderId: "872802887973",
  appId: "1:872802887973:web:20eed35e11cbca07a3d2cc",
  measurementId: "G-X51VB6KEP0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

