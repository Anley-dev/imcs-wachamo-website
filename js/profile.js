// Profile Page - Firebase Integration
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const auth = getAuth();

document.addEventListener("DOMContentLoaded", () => {
    const loadingCard = document.getElementById("profile-loading-card");
    const mainCard = document.getElementById("profile-main-card");
    const emailDisplay = document.getElementById("user-display-email");
    const uidDisplay = document.getElementById("user-display-uid");
    const signinDisplay = document.getElementById("user-display-signin");
    const logoutBtn = document.getElementById("profile-logout-btn");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Show user data
            emailDisplay.textContent = user.displayName || user.email || "IMCS Member";
            uidDisplay.textContent = user.uid ? user.uid.substring(0, 12) + "..." : "---";
            
            const lastSignIn = user.metadata?.lastSignInTime 
                ? new Date(user.metadata.lastSignInTime).toLocaleString() 
                : "Just now";
            signinDisplay.textContent = lastSignIn;

            // Show content
            loadingCard.style.display = "none";
            mainCard.classList.remove("structural-hide");
        } else {
            window.location.href = "login.html";
        }
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to logout?")) {
                try {
                    await signOut(auth);
                    window.location.href = "index.html";
                } catch (error) {
                    alert("Logout failed. Please try again.");
                }
            }
        });
    }
});

