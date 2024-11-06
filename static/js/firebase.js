// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyDiaZ1ASsSGP6jjZjBUQXN0_pdJcB3XNao",
authDomain: "personal-website-8f505.firebaseapp.com",
databaseURL: "https://personal-website-8f505-default-rtdb.firebaseio.com",
projectId: "personal-website-8f505",
storageBucket: "personal-website-8f505.appspot.com",
messagingSenderId: "477534951771",
appId: "1:477534951771:web:6e158efe30eec3b203627e",
measurementId: "G-MZLVR47366"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);