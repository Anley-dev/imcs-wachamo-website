// Syncing perfectly with your Firebase v12.13.0 CDN imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// Your verified Firebase configuration profile
const firebaseConfig = {
    apiKey: "AIzaSyDSlXqHHVNYcx8WTb66RvJazDaMCl3l6B8",
    authDomain: "imcs-wachemo.firebaseapp.com",
    projectId: "imcs-wachemo",
    storageBucket: "imcs-wachemo.firebasestorage.app",
    messagingSenderId: "437248834008",
    appId: "1:437248834008:web:cf328836ff7981d927daad",
    measurementId: "G-DNBVMCHXDN"
};

// Initialize Core Application Services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

let cachedUserTokenName = "Member";

// Establish local cache tracking for user session states across pages
setPersistence(auth, browserLocalPersistence)
    .catch((error) => console.error("Persistence Setup Failure:", error));

/* ==========================================================================
   Security Authentication Monitoring Gate
   ========================================================================== */
onAuthStateChanged(auth, (user) => {
    const dashboardBodyNode = document.getElementById("dashboardBody");

    if (user) {
        console.log("Firebase Auth Success: Session valid for account:", user.email);
        cachedUserTokenName = user.displayName || user.email.split('@')[0];
        
        // Populate display names securely
        const nameFieldEn = document.getElementById("user-display-name");
        const nameFieldAm = document.getElementById("user-display-name-am");
        if (nameFieldEn) nameFieldEn.textContent = cachedUserTokenName;
        if (nameFieldAm) nameFieldAm.textContent = cachedUserTokenName;

        // Strip structural design locks and render the dashboard interface cleanly
        if (dashboardBodyNode) {
            dashboardBodyNode.classList.remove("auth-gate-locked");
            dashboardBodyNode.classList.add("auth-gate-unlocked");
        }
    } else {
        console.warn("Firebase Auth Guard: Missing user token payload. Redirecting back to gateway...");
        
        // Remove the locked state so it doesn't stay stuck on a blank dim screen
        if (dashboardBodyNode) {
            dashboardBodyNode.classList.remove("auth-gate-locked");
        }
        
        // Allow a small window for page renders or debugging logs before booting out
        if (!window.location.pathname.includes("login.html")) {
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
        }
    }
});

/* ==========================================================================
   Interactive Component Engine Actions
   ========================================================================== */

// Logout Terminal Interface Link Hook
const logoutBtn = document.getElementById("logoutTerminalBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        const isAmharic = (document.getElementById('dashLangToggle')?.value === 'am');
        const alertText = isAmharic ? "በእርግጠኝነት መውጣት ይፈልጋሉ?" : "Are you sure you want to log out?";
        
        if (confirm(alertText)) {
            await signOut(auth);
            window.location.href = "index.html";
        }
    });
}

// Module Alert Mechanism
const cardFormations = document.getElementById('cardLaunchFormations');
if (cardFormations) {
    cardFormations.addEventListener('click', () => {
        const activeLanguageMode = document.getElementById('dashLangToggle')?.value;
        if (activeLanguageMode === 'am') {
            alert("አእምሯዊ እና ግንባታ ሞጁሎች በአስተዳዳሪው በመዋቀር ላይ ናቸው።");
        } else {
            alert("Intellect & Formations modules are being configured by the administrator.");
        }
    });
}

// Runtime Translation Infrastructure
const dashLangToggle = document.getElementById('dashLangToggle');
if (dashLangToggle) {
    dashLangToggle.addEventListener('change', (event) => {
        const targetLang = event.target.value;
        
        document.querySelectorAll('.lang-trans').forEach(node => {
            node.innerHTML = (targetLang === 'am') ? node.getAttribute('data-am') : node.getAttribute('data-en');
        });

        // Re-bind names into fresh translation nodes
        const nameFieldEn = document.getElementById("user-display-name");
        const nameFieldAm = document.getElementById("user-display-name-am");
        if (nameFieldEn) nameFieldEn.textContent = cachedUserTokenName;
        if (nameFieldAm) nameFieldAm.textContent = cachedUserTokenName;
    });
}
