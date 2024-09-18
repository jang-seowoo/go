// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASS_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASS_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASS_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASS_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASS_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASS_APPID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASS_MEASUREMENTID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스 초기화
const firestore = getFirestore(app);

export { firestore }; // named export로 Firestore 인스턴스 내보내기