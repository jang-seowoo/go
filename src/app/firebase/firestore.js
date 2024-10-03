// firebase/firestore.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase 초기화
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASS_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASS_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASS_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASS_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASS_MESSAGINGSENDERID,
    appId: process.env.NEXT_PUBLIC_FIREBASS_APPID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASS_MEASUREMENTID
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 가져오기
const db = getFirestore(app);

// db 내보내기
export { db }; // ES6 모듈 방식으로 내보내기
