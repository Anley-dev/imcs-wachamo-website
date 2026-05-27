
// IMCS Wachemo - Firebase Auth 
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCxD9h4BBPNbbuepLTEyQIesMj44eEqdNA",
    authDomain: "imcs-wachamo.firebaseapp.com",
    projectId: "imcs-wachamo",
    storageBucket: "imcs-wachamo.firebasestorage.app",
    messagingSenderId: "445125483030",
    appId: "1:445125483030:web:2eaa94ecac7a13ef0fb337"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const protectedPages = ["dashboard.html", "profile.html", "events.html", "gallery.html", "admin.html"];

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // Registration & Login forms (same as before)
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => { /* ... same as previous */ });
    }
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            clearErrors();
            // ... same login logic
            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "dashboard.html";
            } catch (error) {
                handleAuthError(error, "Login");
            }
        });
    }
});

// Main Auth Handler
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const protectedContent = document.getElementById("protected-content");

    // Navbar update
    const logoutBtn = document.getElementById("logoutBtn") || document.querySelector(".nav-btn");
    if (logoutBtn) {
        if (user) {
            logoutBtn.textContent = "Logout";
            logoutBtn.onclick = async () => {
                if (confirm("Logout?")) {
                    await signOut(auth);
                    window.location.href = "index.html";
                }
            };
        } else {
            logoutBtn.textContent = "Login";
            logoutBtn.href = "login.html";
        }
    }

    // Handle Protected Pages
    if (protectedPages.includes(currentPage)) {
        if (user) {
            if (protectedContent) protectedContent.style.display = "block";
            // Show user name if element exists
            const userNameEl = document.getElementById("user-name");
            if (userNameEl) userNameEl.textContent = user.displayName || "Member";
        } else {
            setTimeout(() => {
                alert("🔒 Please login to access this page.");
                window.location.href = "login.html";
            }, 300);
        }
    }
});

function handleAuthError(error, context) {
    let msg = error.message || "An unexpected error occurred.";
    if (error.code === "auth/invalid-credential") msg = "Invalid email or password.";
    alert(`❌ ${context} Failed: ${msg}`);
}

function clearErrors() {
    document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
}

