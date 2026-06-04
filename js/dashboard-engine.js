import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ⚠️ Ensure these credentials completely match the setup variables on your login.html
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let cachedUserTokenName = "Member";

// Enforce local browser token storage rules across page redirects
setPersistence(auth, browserLocalPersistence)
    .catch((error) => console.error("Persistence error:", error));

// Auth State Monitor
onAuthStateChanged(auth, (user) => {
    if (user) {
        cachedUserTokenName = user.displayName || user.email.split('@')[0];
        
        // Sync custom user name fields
        const nameFieldEn = document.getElementById("user-display-name");
        const nameFieldAm = document.getElementById("user-display-name-am");
        if (nameFieldEn) nameFieldEn.textContent = cachedUserTokenName;
        if (nameFieldAm) nameFieldAm.textContent = cachedUserTokenName;

        // Unlatch CSS Lock Gate
        const dashboardBodyNode = document.getElementById("dashboardBody");
        if (dashboardBodyNode) {
            dashboardBodyNode.classList.remove("auth-gate-locked");
            dashboardBodyNode.classList.add("auth-gate-unlocked");
        }
    } else {
        if (!window.location.pathname.includes("login.html")) {
            window.location.href = "login.html";
        }
    }
});

// Logout Event Action
const logoutBtn = document.getElementById("logoutTerminalBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        const isAmharic = (document.getElementById('dashLangToggle').value === 'am');
        const alertText = isAmharic ? "በእርግጠኝነት መውጣት ይፈልጋሉ?" : "Are you sure you want to log out?";
        
        if (confirm(alertText)) {
            await signOut(auth);
            window.location.href = "index.html";
        }
    });
}

// Formations Module Fallback Alert
const cardFormations = document.getElementById('cardLaunchFormations');
if (cardFormations) {
    cardFormations.addEventListener('click', () => {
        const activeLanguageMode = document.getElementById('dashLangToggle').value;
        if (activeLanguageMode === 'am') {
            alert("አእምሯዊ እና ግንባታ ሞጁሎች በአስተዳዳሪው በመዋቀር ላይ ናቸው።");
        } else {
            alert("Intellect & Formations modules are being configured by the administrator.");
        }
    });
}

// Multilingual Interface Engine 
const dashLangToggle = document.getElementById('dashLangToggle');
if (dashLangToggle) {
    dashLangToggle.addEventListener('change', (event) => {
        const targetLang = event.target.value;
        
        document.querySelectorAll('.lang-trans').forEach(node => {
            node.innerHTML = (targetLang === 'am') ? node.getAttribute('data-am') : node.getAttribute('data-en');
        });

        // Re-inject dynamic name fields safely back into updated node hierarchies
        const nameFieldEn = document.getElementById("user-display-name");
        const nameFieldAm = document.getElementById("user-display-name-am");
        if (nameFieldEn) nameFieldEn.textContent = cachedUserTokenName;
        if (nameFieldAm) nameFieldAm.textContent = cachedUserTokenName;
    });
}
