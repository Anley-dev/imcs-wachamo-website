// IMCS Wachemo - Core Firebase Integration Module
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Web application Firebase configuration matrix
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "imcs-wachamo-website.firebaseapp.com",
    projectId: "imcs-wachamo-website",
    storageBucket: "imcs-wachamo-website.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase Instance
const app = initializeApp(firebaseConfig);

// Export instances for Auth and Database services across modular architecture
export const auth = getAuth(app);
export const db = getFirestore(app);

