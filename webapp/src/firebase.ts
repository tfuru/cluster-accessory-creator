import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// TODO: Firebase コンソールから取得した設定に置き換えてください
const fallbackConfig = {
  apiKey: "AIzaSyC7TC7rWs3oYulch2aOv7400rNLHH_9uCw",
  authDomain: "cluster-accessory-creator.firebaseapp.com",
  projectId: "cluster-accessory-creator",
  storageBucket: "cluster-accessory-creator.firebasestorage.app",
  messagingSenderId: "1049894281160",
  appId: "1:1049894281160:web:470cb7ced6688eb509eafd",
  measurementId: "G-BVECM89QS3"
};

const firebaseConfig = (window as any).firebaseConfig || fallbackConfig;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

if (location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8082);
  connectStorageEmulator(storage, "localhost", 9199);
}
