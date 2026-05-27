
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

// Protected Pages
const protectedPages = ["dashboard.html", "profile.html", "events.html", "gallery.html", "admin.html"];

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // Registration
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            clearErrors();

            const name = document.getElementById("reg-name")?.value.trim();
            const email = document.getElementById("reg-email")?.value.trim();
            const password = document.getElementById("reg-password")?.value;
            const confirm = document.getElementById("reg-confirm-password")?.value;

            if (!name) return showError("reg-name", "Full name is required");
            if (!email) return showError("reg-email", "Email is required");
            if (password.length < 8) return showError("reg-password", "Password must be at least 8 characters");
            if (password !== confirm) return showError("reg-confirm-password", "Passwords do not match");

            const btn = registerForm.querySelector("button");
            const text = btn.textContent;
            btn.disabled = true;
            btn.textContent = "Creating...";

            try {
                const userCred = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCred.user, { displayName: name });
                alert(`✅ Welcome ${name}!`);
                window.location.href = "login.html";
            } catch (error) {
                handleAuthError(error, "Registration");
            } finally {
                btn.disabled = false;
                btn.textContent = text;
            }
        });
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            clearErrors();

            const email = document.getElementById("login-email")?.value.trim();
            const password = document.getElementById("login-password")?.value;

            if (!email) return showError("login-email", "Email is required");
            if (!password) return showError("login-password", "Password is required");

            const btn = loginForm.querySelector("button");
            const text = btn.textContent;
            btn.disabled = true;
            btn.textContent = "Signing In...";

            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "dashboard.html";
            } catch (error) {
                handleAuthError(error, "Login");
            } finally {
                btn.disabled = false;
                btn.textContent = text;
            }
        });
    }
});

// Global Auth Listener
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    // Navbar handling (supports both .nav-btn and #logoutBtn)
    const navBtn = document.querySelector(".nav-btn") || document.getElementById("logoutBtn");
    if (navBtn) {
        if (user) {
            navBtn.textContent = "Logout";
            navBtn.onclick = async (e) => {
                e.preventDefault();
                if (confirm("Logout?")) {
                    await signOut(auth);
                    window.location.href = "index.html";
                }
            };
        } else {
            navBtn.textContent = "Login";
            navBtn.href = "login.html";
        }
    }

    // Page Protection
    if (protectedPages.includes(currentPage) && !user) {
        alert("🔒 Please login to access this page.");
        window.location.href = "login.html";
    }
});

function handleAuthError(error, context) {
    console.error(error);
    let msg = "An unexpected error occurred.";
    if (error.code === "auth/invalid-credential") msg = "Invalid email or password.";
    if (error.code === "auth/email-already-in-use") msg = "Email already registered.";
    alert(`❌ ${context} Failed: ${msg}`);
}

function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.classList.add("error");
    alert(msg);
}

function clearErrors() {
    document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
}

