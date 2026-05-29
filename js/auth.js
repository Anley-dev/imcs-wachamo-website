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

// Get Firebase config from config.js
const firebaseConfig = window.FIREBASE_CONFIG;

if (!firebaseConfig) {
    throw new Error("Firebase configuration not found");
}

// Initialize Firebase
const app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

const auth = getAuth(app);

const protectedPages = ["dashboard.html", "profile.html", "events.html", "gallery.html", "admin.html", "news.html"];

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
            const confirmPassword = document.getElementById("reg-confirm-password")?.value;

            if (!name) return showError("reg-name", "Full name is required");
            if (!email) return showError("reg-email", "Email is required");
            if (password.length < 8) return showError("reg-password", "Password must be at least 8 characters");
            if (password !== confirmPassword) return showError("reg-confirm-password", "Passwords do not match");

            const btn = registerForm.querySelector("button");
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = "Creating Account...";

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                alert(`✅ Registration Successful! Welcome ${name}`);
                window.location.href = "login.html";
            } catch (error) {
                handleAuthError(error, "Registration");
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
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
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = "Signing In...";

            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "dashboard.html";
            } catch (error) {
                handleAuthError(error, "Login");
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }
});

// Global Auth State
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    // Navbar
    const logoutBtn = document.getElementById("logoutBtn") || document.querySelector(".nav-btn");
    if (logoutBtn) {
        if (user) {
            logoutBtn.textContent = "Logout";
            logoutBtn.onclick = async (e) => {
                e.preventDefault();
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

    // Better Protection
    if (protectedPages.includes(currentPage)) {
        if (!user) {
            setTimeout(() => {
                alert("🔒 Please login to access this page.");
                window.location.href = "login.html";
            }, 100);
        }
    }
});

function handleAuthError(error, context) {
    console.error(error);
    let msg = "An unexpected error occurred.";
    if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        msg = "Invalid email or password.";
    } else if (error.code === "auth/email-already-in-use") {
        msg = "This email is already registered.";
    }
    alert(`❌ ${context} Failed: ${msg}`);
}

function showError(id, message) {
    const field = document.getElementById(id);
    if (field) field.classList.add("error");
    alert(message);
}

function clearErrors() {
    document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
}
