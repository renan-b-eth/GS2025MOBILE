
import { initializeApp, getApps, getApp } from 'firebase/app';
import {getFirestore} from 'firebase/firestore'
import { getAuth} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyAzZHL_J9PwkXNUgXDNP0yepCzDi-Xc4xQ",
    authDomain: "abrigomais.firebaseapp.com",
    projectId: "abrigomais",
    storageBucket: "abrigomais.firebasestorage.app",
    messagingSenderId: "725977710163",
    appId: "1:725977710163:web:d4704b338bdcbdc97f90a6",
    measurementId: "G-SY62R1SYC1"
};

let app = initializeApp(firebaseConfig);
let auth = getAuth(app);
let db = getFirestore(app);


export { app, auth };