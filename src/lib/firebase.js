import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACn3sqtCdt5LSdO657nf1CHti19aToxCE",
  authDomain: "friends-a5f47.firebaseapp.com",
  projectId: "friends-a5f47",
  storageBucket: "friends-a5f47.firebasestorage.app",
  messagingSenderId: "1013690470282",
  appId: "1:1013690470282:web:0861cd044f832d7bb30273",
  measurementId: "G-PXJRYVS6RQ"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);