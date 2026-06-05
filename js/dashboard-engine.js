// Syncing perfectly with your Firebase v12.13.0 CDN imports
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// CORRECTED Firebase configuration profile
const firebaseConfig = {
    apiKey: "AIzaSyCxD9h4BBPNbbuepLTEyQIesMj44eEqdNA",
    authDomain: "imcs-wachamo.firebaseapp.com",
    projectId: "imcs-wachamo",
    storageBucket: "imcs-wachamo.firebasestorage.app",
    messagingSenderId: "445125483030",
    appId: "1:445125483030:web:2eaa94ecac7a13ef0fb337"
};

// Initialize Core Application Services
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const analytics = getAnalytics(app);
const auth = getAuth(app);

let cachedUserTokenName = "Member";

// Establish local cache tracking for user session states across pages
setPersistence(auth, browserLocalPersistence)
    .catch((error) => console.error("Persistence Setup Failure:", error));

/* ==========================================================================
   Security Authentication Monitoring Gate & Grace Period Filter
   ========================================================================== */
let isFirstHandshakeCheck = true;

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
        isFirstHandshakeCheck = false;
    } else {
        // If it's the absolute first split-second of the page loading, give Firebase a moment to breathe
        if (isFirstHandshakeCheck) {
            isFirstHandshakeCheck = false;
            console.log("Auth handshake pending token verification... waiting for local storage resolve.");

            // Wait 1.5 seconds to see if the session registers before enforcing the boot rule
            setTimeout(() => {
                if (!auth.currentUser && !window.location.pathname.includes("login.html")) {
                    console.warn("Firebase Auth Guard: Token missing after grace period. Redirecting...");
                    if (dashboardBodyNode) dashboardBodyNode.classList.remove("auth-gate-locked");
                    window.location.href = "login.html";
                }
            }, 1500);
        } else {
            // If it's not the first load and the user explicitly lacks a token, redirect immediately
            console.warn("Firebase Auth Guard: Missing user token payload. Redirecting back to gateway...");
            if (dashboardBodyNode) dashboardBodyNode.classList.remove("auth-gate-locked");
            if (!window.location.pathname.includes("login.html")) {
                window.location.href = "login.html";
            }
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
