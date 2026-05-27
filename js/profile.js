
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    const loading = document.getElementById("profile-loading-card");
    const main = document.getElementById("profile-main-card");

    if (user) {
        loading.style.display = "none";
        main.classList.remove("structural-hide");

        document.getElementById("user-display-email").textContent = user.displayName || user.email || "IMCS Member";
        document.getElementById("user-display-uid").textContent = user.uid ? user.uid.substring(0, 12) + "..." : "---";
    } else {
        window.location.href = "login.html";
    }
});

document.getElementById("profile-logout-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    if (confirm("Logout?")) {
        await signOut(auth);
        window.location.href = "index.html";
    }
});

