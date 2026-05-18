// IMCS Wachemo - Firebase Authentication
// Updated: May 2026

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// ==================== NEW FIREBASE CONFIG ====================
const firebaseConfig = {
    apiKey: "AIzaSyDSlXqHHVNYcx8WTb66RvJazDaMCl3l6B8",
    authDomain: "imcs-wachemo.firebaseapp.com",
    projectId: "imcs-wachemo",
    storageBucket: "imcs-wachemo.firebasestorage.app",
    messagingSenderId: "437248834008",
    appId: "1:437248834008:web:cf328836ff7981d927daad",
    measurementId: "G-DNBVMCHXDN"
};

// Initialize Firebase (singleton pattern - prevents multiple instances)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const analytics = getAnalytics(app);
const auth = getAuth(app);

auth.languageCode = 'en';

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // ====================== REGISTRATION ======================
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("reg-name")?.value.trim();
            const email = document.getElementById("reg-email")?.value.trim();
            const password = document.getElementById("reg-password")?.value;
            const confirmPassword = document.getElementById("reg-confirm-password")?.value;

            clearErrors();

            if (!name) return showError("reg-name", "Full name is required");
            if (!email) return showError("reg-email", "Email is required");
            if (password.length < 8) return showError("reg-password", "Password must be at least 8 characters long");
            if (password !== confirmPassword) return showError("reg-confirm-password", "Passwords do not match");

            const submitBtn = registerForm.querySelector("button[type='submit']");
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Creating Account...";

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                await updateProfile(userCredential.user, { displayName: name });

                alert(`✅ Welcome ${name}! Your account has been created successfully.`);
                window.location.href = "login.html";

            } catch (error) {
                handleAuthError(error, "Registration");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // ====================== LOGIN ======================
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email")?.value.trim();
            const password = document.getElementById("login-password")?.value;

            clearErrors();

            if (!email) return showError("login-email", "Email is required");
            if (!password) return showError("login-password", "Password is required");

            const submitBtn = loginForm.querySelector("button[type='submit']");
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Signing In...";

            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "index.html";
            } catch (error) {
                handleAuthError(error, "Login");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // ====================== AUTH STATE ======================
    onAuthStateChanged(auth, (user) => {
        const navBtn = document.querySelector(".nav-btn");

        if (user) {
            if (navBtn) {
                navBtn.textContent = "Logout";
                navBtn.href = "#";
                navBtn.classList.add("logout-active-btn");

                navBtn.onclick = async (e) => {
                    e.preventDefault();
                    if (confirm("Are you sure you want to log out?")) {
                        await signOut(auth);
                        window.location.reload();
                    }
                };
            }
        } else {
            if (navBtn) {
                navBtn.textContent = "Login";
                navBtn.href = "login.html";
                navBtn.classList.remove("logout-active-btn");
                navBtn.onclick = null;
            }
        }
    });
});

// ====================== ERROR HANDLER ======================
function handleAuthError(error, context) {
    console.error(`${context} Error:`, error.code, error.message);

    let msg = "An unexpected error occurred.";

    switch (error.code) {
        case "auth/email-already-in-use": msg = "This email is already registered."; break;
        case "auth/invalid-email": msg = "Please enter a valid email address."; break;
        case "auth/weak-password": msg = "Password should be at least 8 characters."; break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential": msg = "Incorrect email or password."; break;
        case "auth/too-many-requests": msg = "Too many attempts. Try again later."; break;
        case "auth/network-request-failed": msg = "Network error. Please check your connection."; break;
    }

    alert(`❌ ${context} Failed: ${msg}`);
}

function showError(id, message) {
    const field = document.getElementById(id);
    if (field) {
        field.classList.add("error");
        alert(message);
    }
}

function clearErrors() {
    document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
}

export { auth, app };
