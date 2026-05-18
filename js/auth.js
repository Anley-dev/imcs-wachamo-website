cat << 'EOF' > js/auth.js
// Upgraded to stable Firebase v12.13.0
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

// Initialize App instance safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // 📝 REGISTRATION CONTROLLER
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("register-name").value.trim();
            const email = document.getElementById("register-email").value.trim();
            const password = document.getElementById("register-password").value;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Attach the user's name to their profile
                await updateProfile(userCredential.user, { displayName: name });
                alert("Account created successfully! Welcome to IMCS.");
                window.location.href = "login.html";
            } catch (error) {
                alert("Registration Failed: " + error.message);
            }
        });
    }

    // 🔑 LOGIN CONTROLLER
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                alert("Login successful! Redirecting to your dashboard...");
                window.location.href = "dashboard.html";
            } catch (error) {
                alert("Login Failed: " + error.message);
            }
        });
    }
});

// 🔄 Dynamic Navbar UI Sync Listener
onAuthStateChanged(auth, (user) => {
    const dashboardLink = document.querySelector('a[href="dashboard.html"]');
    const loginBtn = document.querySelector('.nav-btn');

    if (user) {
        // User is LOGGED IN: Show dashboard, turn Login button to Logout action handles
        if (dashboardLink) dashboardLink.style.display = "block";
        if (loginBtn) {
            loginBtn.textContent = "Logout";
            loginBtn.href = "#";
            loginBtn.classList.add("logout-active-btn");
        }
    } else {
        // User is LOGGED OUT: Hide dashboard link, show classic Login link
        if (dashboardLink) dashboardLink.style.display = "none";
        if (loginBtn) {
            loginBtn.textContent = "Login";
            loginBtn.href = "login.html";
            loginBtn.classList.remove("logout-active-btn");
        }
    }
});

// 🚪 Global Logout Action Controller
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("logout-active-btn")) {
        e.preventDefault();
        try {
            await signOut(auth);
            alert("You have logged out successfully.");
            window.location.href = "index.html";
        } catch (error) {
            console.error("Logout Error:", error.message);
        }
    }
});
    // Registration
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            clearErrors();

            const name = document.getElementById("reg-name").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const password = document.getElementById("reg-password").value;
            const confirmPassword = document.getElementById("reg-confirm-password").value;

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

    // Login (same logic as before, kept clean)
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            clearErrors();

            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;

            if (!email) return showError("login-email", "Email is required");
            if (!password) return showError("login-password", "Password is required");

            const submitBtn = loginForm.querySelector("button");
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Signing In...";

            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "dashboard.html";
            } catch (error) {
                handleAuthError(error, "Login");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // Navbar Auth State
    onAuthStateChanged(auth, (user) => {
        const navBtn = document.querySelector(".nav-btn");
        if (!navBtn) return;

        if (user) {
            navBtn.textContent = "Logout";
            navBtn.href = "#";
            navBtn.onclick = async (e) => {
                e.preventDefault();
                if (confirm("Logout?")) {
                    await signOut(auth);
                    window.location.reload();
                }
            };
        } else {
            navBtn.textContent = "Login";
            navBtn.href = "login.html";
            navBtn.onclick = null;
        }
    });
});

function handleAuthError(error, context) {
    console.error(`${context} Error:`, error);   // ← This helps us debug

    let msg = error.message || "An unexpected error occurred.";

    switch (error.code) {
        case "auth/email-already-in-use":
            msg = "This email is already registered. Try logging in instead.";
            break;
        case "auth/invalid-email":
            msg = "Please enter a valid email address.";
            break;
        case "auth/weak-password":
            msg = "Password is too weak. Use at least 8 characters with numbers and symbols.";
            break;
        case "auth/operation-not-allowed":
            msg = "Registration is currently disabled. Contact admin.";
            break;
        case "auth/too-many-requests":
            msg = "Too many attempts. Please wait a few minutes and try again.";
            break;
    }

    alert(`❌ ${context} Failed: ${msg}`);
}

function showError(id, message) {
    const field = document.getElementById(id);
    if (field) {
        field.classList.add("error");
        alert(message);   // You can improve this later with inline messages
    }
}

function clearErrors() {
    document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
}
