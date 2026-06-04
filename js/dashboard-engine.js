import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// Added setPersistence and browserLocalPersistence to prevent session drops
import { getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ⚠️ Insert your active Firebase credentials here
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Framework Core Elements
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let cachedUserTokenName = "Member";

// Enforce robust local state caching so the browser remembers the token across refreshes
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("Firebase state persistence established securely: Local Storage Mode active.");
    })
    .catch((error) => {
        console.error("Persistence configuration failure:", error);
    });

/* ==========================================================================
   State Engine Logic Hooks & Protection System
   ========================================================================== */

// Auth State Monitor Pipeline
onAuthStateChanged(auth, (user) => {
    console.log("Auth state change intercepted. Evaluating active session payload...");
    
    if (user) {
        console.log("Session Verified! User UID:", user.uid);
        cachedUserTokenName = user.displayName || user.email.split('@')[0];
        
        // Render verified session values inside the DOM tree nodes safely
        syncDynamicTextNodeVariables();
        
        const profileEmailInput = document.getElementById("profileRegistryEmail");
        if (profileEmailInput) {
            profileEmailInput.value = user.email;
        }
        
        // Core Security State Gate Switcher Execution
        const dashboardBodyNode = document.getElementById("dashboardBody");
        if (dashboardBodyNode) {
            dashboardBodyNode.classList.remove("auth-gate-locked");
            dashboardBodyNode.classList.add("auth-gate-unlocked");
            console.log("Workspace gate unlatched successfully. CSS locks stripped.");
        }
    } else {
        // Enforce fallback lock routing immediately with strict debug parameters
        console.warn("No active authorization token found or session has expired. Redirecting to login gateway...");
        
        // Added safety: prevents redirect loop if you are already on the login page
        if (!window.location.pathname.includes("login.html")) {
            window.location.href = "login.html";
        }
    }
});

// User Session Terminate Execution
const logoutBtn = document.getElementById("logoutTerminalBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        const isAmharic = (document.getElementById('dashLangToggle').value === 'am');
        const systemPromptText = isAmharic ? "በእርግጠኝነት መውጣት ይፈልጋሉ?" : "Are you sure you want to log out?";
        
        if (confirm(systemPromptText)) {
            await signOut(auth);
            window.location.href = "index.html";
        }
    });
}

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
    console.log(`Routing internal view matrix to panel target: #${targetPanelId}`);
    
    document.querySelectorAll('.tab-panel-node').forEach(panelNode => {
        panelNode.classList.remove('active-view');
    });
    
    const targetedPanel = document.getElementById(targetPanelId);
    if (targetedPanel) {
        targetedPanel.classList.add('active-view');
    }

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
const cardEvents = document.getElementById('cardLaunchEvents');
if (cardEvents) {
    cardEvents.addEventListener('click', () => {
        executeTabPanelChange('events-view-panel', navigationButtonsList['events-view-panel']);
    });
}

const cardNews = document.getElementById('cardLaunchNews');
if (cardNews) {
    cardNews.addEventListener('click', () => {
        executeTabPanelChange('news-view-panel', navigationButtonsList['news-view-panel']);
    });
}

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

/* ==========================================================================
   Zero-Latency Localization Interface Operations
   ========================================================================== */
const dashLangToggle = document.getElementById('dashLangToggle');

if (dashLangToggle) {
    dashLangToggle.addEventListener('change', (event) => {
        const dynamicTargetLang = event.target.value;
        
        document.querySelectorAll('.lang-trans').forEach(transNode => {
            if (dynamicTargetLang === 'am') {
                transNode.innerHTML = transNode.getAttribute('data-am');
            } else {
                transNode.innerHTML = transNode.getAttribute('data-en');
            }
        });
        
        syncDynamicTextNodeVariables();
    });
}

function syncDynamicTextNodeVariables() {
    const nameFieldEn = document.getElementById("user-display-name");
    const nameFieldAm = document.getElementById("user-display-name-am");
    const profileNameInput = document.getElementById("profileRegistryName");
    
    if (nameFieldEn) nameFieldEn.textContent = cachedUserTokenName;
    if (nameFieldAm) nameFieldAm.textContent = cachedUserTokenName;
    if (profileNameInput) profileNameInput.value = cachedUserTokenName;
}
