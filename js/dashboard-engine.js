import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ⚠️ INJECTION CONFIGURATION STEP: Insert your Firebase Web API Credentials parameters here
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Establish Framework Initialization Parameters Securely
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let cachedUserTokenName = "Member";

/* ==========================================================================
   State Engine Logic Hooks
   ========================================================================== */

// Auth State Monitor Pipeline
onAuthStateChanged(auth, (user) => {
    if (user) {
        cachedUserTokenName = user.displayName || user.email.split('@')[0];
        
        // Render verified session values inside the DOM tree nodes safely
        syncDynamicTextNodeVariables();
        document.getElementById("profileRegistryEmail").value = user.email;
        
        // Core Security State Gate Switcher Execution
        const dashboardBodyNode = document.getElementById("dashboardBody");
        dashboardBodyNode.classList.remove("auth-gate-locked");
        dashboardBodyNode.classList.add("auth-gate-unlocked");
    } else {
        // Enforce fallback lock routing immediately
        window.location.href = "login.html";
    }
});

// User Session Terminate Execution
document.getElementById("logoutTerminalBtn").addEventListener("click", async () => {
    const isAmharic = (document.getElementById('dashLangToggle').value === 'am');
    const systemPromptText = isAmharic ? "በእርግጠኝነት መውጣት ይፈልጋሉ?" : "Are you sure you want to log out?";
    
    if (confirm(systemPromptText)) {
        await signOut(auth);
        window.location.href = "index.html";
    }
});

/* ==========================================================================
   Tab Navigation & Multi-View Interface Panel Functions
   ========================================================================== */

const navigationButtonsList = {
    'hub-view-panel': document.getElementById('navTabHub'),
    'events-view-panel': document.getElementById('navTabEvents'),
    'news-view-panel': document.getElementById('navTabNews'),
    'profile-view-panel': document.getElementById('navTabProfile')
};

// Base Routing Switch Mechanism
function executeTabPanelChange(targetPanelId, activeTriggerButton) {
    document.querySelectorAll('.tab-panel-node').forEach(panelNode => {
        panelNode.classList.remove('active-view');
    });
    document.getElementById(targetPanelId).classList.add('active-view');

    document.querySelectorAll('.nav-link-btn').forEach(buttonNode => {
        buttonNode.classList.remove('active');
    });
    if (activeTriggerButton) {
        activeTriggerButton.classList.add('active');
    }
}

// Bind Navigation Node Event Listeners loops cleanly
Object.entries(navigationButtonsList).forEach(([panelId, structuralButton]) => {
    if (structuralButton) {
        structuralButton.addEventListener('click', () => {
            executeTabPanelChange(panelId, structuralButton);
        });
    }
});

// Intercept Feature Cards click actions to bridge panel routing maps cleanly
document.getElementById('cardLaunchEvents').addEventListener('click', () => {
    executeTabPanelChange('events-view-panel', navigationButtonsList['events-view-panel']);
});

document.getElementById('cardLaunchNews').addEventListener('click', () => {
    executeTabPanelChange('news-view-panel', navigationButtonsList['news-view-panel']);
});

document.getElementById('cardLaunchFormations').addEventListener('click', () => {
    const activeLanguageMode = document.getElementById('dashLangToggle').value;
    if (activeLanguageMode === 'am') {
        alert("አእምሯዊ እና ግንባታ ሞጁሎች በአስተዳዳሪው በመዋቀር ላይ ናቸው።");
    } else {
        alert("Intellect & Formations modules are being configured by the administrator.");
    }
});

/* ==========================================================================
   Zero-Latency Localization Interface Operations
   ========================================================================== */
const dashLangToggle = document.getElementById('dashLangToggle');

dashLangToggle.addEventListener('change', (event) => {
    const dynamicTargetLang = event.target.value;
    
    document.querySelectorAll('.lang-trans').forEach(transNode => {
        if (dynamicTargetLang === 'am') {
            transNode.innerHTML = transNode.getAttribute('data-am');
        } else {
            transNode.innerHTML = transNode.getAttribute('data-en');
        }
    });
    
    // Maintain variable consistency safely within newly inserted translation templates
    syncDynamicTextNodeVariables();
});

function syncDynamicTextNodeVariables() {
    const nameFieldEn = document.getElementById("user-display-name");
    const nameFieldAm = document.getElementById("user-display-name-am");
    
    if (nameFieldEn) nameFieldEn.textContent = cachedUserTokenName;
    if (nameFieldAm) nameFieldAm.textContent = cachedUserTokenName;
    document.getElementById("profileRegistryName").value = cachedUserTokenName;
}
