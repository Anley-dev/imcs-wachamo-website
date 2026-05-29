
// IMCS Wachemo - Strong Auth Protection
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

const protectedPages = ["dashboard.html", "profile.html", "admin.html", "events.html", "gallery.html"];

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // Registration
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("reg-name")?.value.trim();
            const email = document.getElementById("reg-email")?.value.trim();
            const phone = document.getElementById("reg-phone")?.value.trim();
            const password = document.getElementById("reg-password")?.value;
            const confirm = document.getElementById("reg-confirm-password")?.value;

            if (password !== confirm) return alert("Passwords do not match");

            try {
                const userCred = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCred.user, { displayName: name });
                alert("✅ Registration successful! Please login.");
                window.location.href = "login.html";
            } catch (error) {
                alert("Registration failed: " + error.message);
            }
        });
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email")?.value.trim();
            const password = document.getElementById("login-password")?.value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "dashboard.html";
            } catch (error) {
                alert("Login failed: Invalid email or password");
            }
        });
    }
});

// Strong Global Protection
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    // Update Logout Button
    const logoutBtn = document.getElementById("logoutBtn") || document.querySelector(".btn-logout");
    if (logoutBtn) {
        logoutBtn.textContent = user ? "Logout" : "Login";
        logoutBtn.onclick = user ? async () => {
            if (confirm("Logout?")) {
                await signOut(auth);
                window.location.href = "index.html";
            }
        } : null;
    }

    // Strong Page Protection
    if (protectedPages.includes(currentPage)) {
        if (!user) {
            window.location.replace("login.html");   // Use replace to prevent back button
        }
    }
});

