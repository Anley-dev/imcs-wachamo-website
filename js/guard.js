import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// Initialize your Firebase app instance here if not already done globally

const auth = getAuth();

// Wait for the DOM to be fully loaded before trying to manipulate classes
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in!
            console.log("User authorized:", user.email);
            
            // 1. Find the hidden container
            const protectedContent = document.getElementById("protected-content");
            
            // 2. Remove the 'structural-hide' class to reveal the dashboard/news/content
            if (protectedContent) {
                protectedContent.classList.remove("structural-hide");
            }
        } else {
            // No user is signed in, redirect them to the login/register page
            console.log("Unauthorized access. Redirecting to login...");
            window.location.href = "login.html"; 
        }
    });
});

