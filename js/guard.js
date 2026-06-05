import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const auth = getAuth();

// Secure Check: Run Firebase auth immediately, don't wait for DOMContentLoaded 
// to prevent unauthorized flashing of content.
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in!
        console.log("User authorized:", user.email);

        // Safely wait for the DOM to be ready before removing the hidden class
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", revealContent);
        } else {
            revealContent();
        }
    } else {
        // No user is signed in, redirect them to login page
        console.log("Unauthorized access. Redirecting to login...");
        window.location.replace("login.html"); 
    }
});

// Helper function to show the dashboard smoothly
function revealContent() {
    const protectedContent = document.getElementById("protected-content");
    if (protectedContent) {
        protectedContent.classList.remove("structural-hide");
    }
}
