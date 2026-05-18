cat << 'EOF' > js/auth.js
// IMCS Wachemo - Client Side Authentication Processor & Configuration
// Updated: May 2026 - Firebase v12.13.0 + Best Practices

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCxD9h4BBPNbbuepLTEyQIesMj44eEqdNA",
    authDomain: "imcs-wachamo.firebaseapp.com",
    projectId: "imcs-wachamo",
    storageBucket: "imcs-wachamo.firebasestorage.app",
    messagingSenderId: "445125483030",
    appId: "1:445125483030:web:2eaa94ecac7a13ef0fb337"
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Optional: Set language (you can make it dynamic based on user preference)
auth.languageCode = 'en';

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // ==========================================
    // REGISTRATION CONTROLLER
    // ==========================================
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("reg-name").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const password = document.getElementById("reg-password").value;
            const confirmPassword = document.getElementById("reg-confirm-password")?.value;

            // Client-side validation
            if (!name) {
                alert("Please enter your full name.");
                return;
            }
            if (password.length < 8) {
                alert("Password must be at least 8 characters long.");
                return;
            }
            if (password !== confirmPassword) {
                alert("Passwords do not match. Please check and try again.");
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                // Save display name to Firebase Auth
                await updateProfile(userCredential.user, {
                    displayName: name
                });

                console.log("Account created successfully:", userCredential.user.uid);
                alert(`Welcome to IMCS Wachemo, ${name}! Your account has been created successfully.`);
                
                // Redirect to login page
                window.location.href = "login.html";
            } catch (error) {
                handleAuthError(error, "Registration");
            }
        });
    }

    // ==========================================
    // LOGIN CONTROLLER
    // ==========================================
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("Login successful:", userCredential.user.uid);
                
                alert("Authentication successful! Redirecting...");
                window.location.href = "index.html";
            } catch (error) {
                handleAuthError(error, "Login");
            }
        });
    }

    // ==========================================
    // GLOBAL AUTH STATE LISTENER
    // ==========================================
    onAuthStateChanged(auth, (user) => {
        const navBtn = document.querySelector(".nav-btn");   // Adjust selector if needed

        if (user) {
            // User is signed in
            if (navBtn) {
                navBtn.textContent = "Logout";
                navBtn.setAttribute("href", "#");
                navBtn.classList.add("logout-active-btn");

                navBtn.onclick = async (e) => {
                    e.preventDefault();
                    if (confirm("Are you sure you want to log out?")) {
                        try {
                            await signOut(auth);
                            alert("You have been logged out successfully.");
                            window.location.reload();
                        } catch (err) {
                            console.error("Logout error:", err);
                        }
                    }
                };
            }
        } else {
            // User is signed out
            if (navBtn) {
                navBtn.textContent = "Login";
                navBtn.setAttribute("href", "login.html");
                navBtn.classList.remove("logout-active-btn");
                navBtn.onclick = null;
            }
        }
    });
});

// Enhanced Error Handler
function handleAuthError(error, context) {
    console.error(`${context} Error:`, error.code, error.message);

    switch (error.code) {
        case "auth/email-already-in-use":
            alert("Registration failed: This email is already registered.");
            break;
        case "auth/invalid-email":
            alert("Please enter a valid email address.");
            break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            alert("Login failed: Incorrect email or password.");
            break;
        case "auth/weak-password":
            alert("Password is too weak. Please choose a stronger password.");
            break;
        case "auth/too-many-requests":
            alert("Too many failed attempts. Please try again later.");
            break;
        default:
            alert(`${context} failed: ${error.message}`);
    }
}

export { auth };   // Optional: export if needed in other modules
EOF
