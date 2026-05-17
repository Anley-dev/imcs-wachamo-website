// IMCS Wachemo - Client Side Authentication Processor
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Extract values directly from UI inputs
            const name = document.getElementById("reg-name").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const password = document.getElementById("reg-password").value;

            // Form validation guards
            if (password.length < 6) {
                alert("Security policy rule: Password must be at least 6 characters long.");
                return;
            }

            try {
                // Submit account request directly to Firebase Authentication cloud services
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                console.log("Account created successfully:", user.uid);
                alert(`Welcome to IMCS Pax Romana Wachemo, ${name}! Your account has been registered.`);
                
                // Redirect cleanly to login terminal page upon successful creation
                window.location.href = "login.html";
                
            } catch (error) {
                console.error("Firebase Auth Error:", error.code, error.message);
                
                // Process clear diagnostic human-readable alerts for the end-user
                switch (error.code) {
                    case "auth/email-already-in-use":
                        alert("Registration failed: This email address is already registered.");
                        break;
                    case "auth/invalid-email":
                        alert("Registration failed: Please enter a valid email layout.");
                        break;
                    case "auth/weak-password":
                        alert("Registration failed: The password provided is too insecure.");
                        break;
                    default:
                        alert(`Registration failed: ${error.message}`);
                }
            }
        });
    }
});

