// IMCS Wachemo - Client Side Authentication Processor
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from "/imcs-wachamo-website/js/firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // ==========================================
    // 1. REGISTRATION CONTROLLER
    // ==========================================
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("reg-name").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const password = document.getElementById("reg-password").value;

            if (password.length < 6) {
                alert("Security policy rule: Password must be at least 6 characters long.");
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                console.log("Account created successfully:", userCredential.user.uid);
                alert(`Welcome to IMCS Pax Romana Wachemo, ${name}! Your account has been registered.`);
                window.location.href = "login.html";
            } catch (error) {
                handleAuthError(error, "Registration");
            }
        });
    }

    // ==========================================
    // 2. LOGIN CONTROLLER
    // ==========================================
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;

            try {
                // Submit sign-in request to Firebase
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("Session authenticated successfully:", userCredential.user.uid);
                alert("Authentication verified successfully! Redirecting to home page...");
                window.location.href = "index.html";
            } catch (error) {
                handleAuthError(error, "Login");
            }
        });
    }

    // ==========================================
    // 3. GLOBAL SESSION STATE WATCHER
    // ==========================================
    onAuthStateChanged(auth, (user) => {
        const loginBtn = document.querySelector(".nav-btn");
        
        if (user) {
            // User is signed in -> Change "Login" button to a dynamic "Logout" link
            if (loginBtn) {
                loginBtn.textContent = "Logout";
                loginBtn.setAttribute("href", "#");
                loginBtn.classList.add("logout-active-btn");
                
                // Attach a single structural sign-out listener
                loginBtn.onclick = async (e) => {
                    e.preventDefault();
                    if (confirm("Are you sure you want to log out of your session?")) {
                        await signOut(auth);
                        alert("Session closed successfully.");
                        window.location.reload();
                    }
                };
            }
        } else {
            // User is signed out -> Ensure button defaults back to standard Login form state
            if (loginBtn) {
                loginBtn.textContent = "Login";
                loginBtn.setAttribute("href", "login.html");
                loginBtn.classList.remove("logout-active-btn");
                loginBtn.onclick = null;
            }
        }
    });
});

// Centralized error diagnostic helper
function handleAuthError(error, context) {
    console.error(`${context} Framework Error:`, error.code, error.message);
    switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            alert(`${context} failed: Invalid credentials entered. Please try again.`);
            break;
        case "auth/email-already-in-use":
            alert(`${context} failed: This email address is already tracked.`);
            break;
        case "auth/invalid-email":
            alert(`${context} failed: Please supply a valid email template.`);
            break;
        default:
            alert(`${context} failed: ${error.message}`);
    }
}

