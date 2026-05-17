// IMCS Wachemo - Client Side Authentication Processor
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // ==========================================
    // 1. REGISTRATION CONTROLLER (UPDATED FOR FIRESTORE PROVISIONING)
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
                // 1. Create the user credential inside Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log("Auth account created successfully:", user.uid);

                // 2. Provision companion profile document inside Firestore 'users' collection
                // Default rule assigns 'member'. You can manually switch your specific UID to 'admin' in the Firebase Console!
                await setDoc(doc(db, "users", user.uid), {
                    displayName: name,
                    email: email,
                    role: "member", // Default security baseline tier
                    registeredAt: new Date().toISOString()
                });
                console.log("Firestore user document mapped safely for UID:", user.uid);

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
            if (loginBtn) {
                loginBtn.textContent = "Logout";
                loginBtn.setAttribute("href", "#");
                loginBtn.classList.add("logout-active-btn");
                
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
            if (loginBtn) {
                loginBtn.textContent = "Login";
                loginBtn.setAttribute("href", "login.html");
                loginBtn.classList.remove("logout-active-btn");
                loginBtn.onclick = null;
            }
        }
    });
});

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

