import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDSlXqHHVNYcx8WTb66RvJazDaMCl3l6B8",
    authDomain: "imcs-wachamo-website.firebaseapp.com",
    projectId: "imcs-wachamo-website",
    storageBucket: "imcs-wachamo-website.appspot.com",
    messagingSenderId: "437248834008",
    appId: "1:437248834008:web:cf328836ff7981d927daad"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            // DIAGNOSTIC ALERT: Force the browser to show us the exact key it's using
            alert("DEBUG: Sending key -> " + firebaseConfig.apiKey);

            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                alert("Login Success!");
                window.location.href = "index.html";
            } catch (error) {
                alert("Firebase rejected it: " + error.message);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("reg-email").value.trim();
            const password = document.getElementById("reg-password").value;
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                alert("Registration Success!");
                window.location.href = "login.html";
            } catch (error) {
                alert("Registration Error: " + error.message);
            }
        });
    }
});
