import { initializeApp } from 'firebase/app';
import { getFirestore } from '@firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7R89gD3FdjdWHgov2EudBTh-fUKKFeKM",
  authDomain: "edf-centro-treinamento.firebaseapp.com",
  projectId: "edf-centro-treinamento",
  storageBucket: "edf-centro-treinamento.appspot.com",
  messagingSenderId: "197119310703",
  appId: "1:197119310703:web:a1262a4b339ce676aa469a",
  measurementId: "G-DQMHM0Q7M1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default db;