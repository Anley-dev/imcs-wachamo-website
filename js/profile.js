// IMCS Wachemo - Protected Space Session Guardian & Data Populator
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const loadingCard = document.getElementById("profile-loading-card");
    const mainCard = document.getElementById("profile-main-card");
    
    const emailDisplay = document.getElementById("user-display-email");
    const uidDisplay = document.getElementById("user-display-uid");
    const signinDisplay = document.getElementById("user-display-signin");
    const logoutBtn = document.getElementById("profile-logout-btn");

    // ==========================================
    // SECURE SESSION HANDSHAKE WATCHER
    // ==========================================
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Access granted to UID:", user.uid);
            
            // Extract metadata fields straight from the user session token
            emailDisplay.textContent = user.email;
            uidDisplay.textContent = user.uid;
            
            // Format creation timestamp cleanly
            const lastSignInTime = user.metadata.lastSignInTime 
                ? new Date(user.metadata.lastSignInTime).toLocaleString() 
                : "Current Active Session";
            signinDisplay.textContent = lastSignInTime;

            // Smoothly swap loading view with the verified private data template
            loadingCard.classList.add("structural-hide");
            mainCard.classList.remove("structural-hide");
        } else {
            // Guard Triggered: No valid session cookie/token caught. Divert path back to terminal.
            console.warn("Unauthorized intercept caught. Routing back to authentication terminal.");
            window.location.href = "login.html";
        }
    });

    // ==========================================
    // CONTEXTUAL SIGN-OUT PROCESSING BLOCK
    // ==========================================
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to invalidate your secure token and exit your profile workspace?")) {
                try {
                    await signOut(auth);
                    alert("Session closed successfully. Tokens invalidated.");
                    window.location.href = "login.html";
                } catch (error) {
                    console.error("Token clearing fault:", error);
                    alert("Error processing session terminal sequence.");
                }
            }
        });
    }
});

