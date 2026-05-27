
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
const protectedPages = ["profile.html", "events.html", "gallery.html", "admin.html", "dashboard.html"];

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // === REGISTRATION ===
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

            const submitBtn = registerForm.querySelector("button");
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Creating Account...";

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                
                alert(`✅ Welcome ${name}! Account created successfully.`);
                window.location.href = "login.html";
            } catch (error) {
                handleAuthError(error, "Registration");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // === LOGIN ===
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            clearErrors();

            const email = document.getElementById("login-email")?.value.trim();
            const password = document.getElementById("login-password")?.value;

            if (!email) return showError("login-email", "Email is required");
            if (!password) return showError("login-password", "Password is required");

            const submitBtn = loginForm.querySelector("button");
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Signing In...";

            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "index.html";   // or "dashboard.html"
            } catch (error) {
                handleAuthError(error, "Login");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});

// === GLOBAL AUTH STATE LISTENER ===
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navBtn = document.querySelector(".nav-btn");

    // Update Navbar
    if (navBtn) {
        if (user) {
            navBtn.textContent = "Logout";
            navBtn.href = "#";
            navBtn.onclick = async (e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to logout?")) {
                    await signOut(auth);
                    window.location.href = "index.html";
                }
            };
        } else {
            navBtn.textContent = "Login";
            navBtn.href = "login.html";
            navBtn.onclick = null;
        }
    }

    // Protect restricted pages
    if (protectedPages.includes(currentPage) && !user) {
        alert("🔒 Please login to access this page.");
        window.location.href = "login.html";
    }
});

function handleAuthError(error, context) {
    console.error(`${context} Error:`, error);
    let msg = error.message || "An unexpected error occurred.";

    switch (error.code) {
        case "auth/email-already-in-use": msg = "This email is already registered."; break;
        case "auth/invalid-email": msg = "Please enter a valid email."; break;
        case "auth/weak-password": msg = "Password is too weak. Use at least 8 characters."; break;
        case "auth/too-many-requests": msg = "Too many attempts. Try again later."; break;
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

