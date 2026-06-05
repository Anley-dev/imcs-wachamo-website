import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCxD9h4BBPNbbuepLTEyQIesMj44eEqdNA",
    authDomain: "imcs-wachamo.firebaseapp.com",
    projectId: "imcs-wachamo",
    storageBucket: "imcs-wachamo.firebasestorage.app",
    messagingSenderId: "445125483030",
    appId: "1:445125483030:web:2eaa94ecac7a13ef0fb337"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User authenticated successfully:", user.email);
        
        try {
            const docRef = doc(db, "portal_content", "spiritual_events");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                
                if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", () => renderProtectedLayout(data, user));
                } else {
                    renderProtectedLayout(data, user);
                }
            } else {
                handleSecureFailure("Data configuration profile missing.");
            }
        } catch (error) {
            console.error("Database restriction policy block:", error);
            handleSecureFailure("Access Denied: Insufficient permissions.");
        }
    } else {
        console.warn("Security policy violation: Missing token payload. Evicting browser session...");
        window.location.replace("login.html"); 
    }
});

function renderProtectedLayout(data, user) {
    const container = document.getElementById("protected-content");
    if (!container) return;

    container.innerHTML = `
        <div class="dashboard-header">
            <h2>Welcome Back, ${user.displayName || 'Member'}</h2>
            <p>Active Portal Clearance: Authorized</p>
        </div>
        <div class="events-grid">
            <h3>Upcoming Spiritual Programs</h3>
            <p>${data.upcoming_event_details || 'No events currently scheduled.'}</p>
        </div>
    `;
}

function handleSecureFailure(message) {
    const container = document.getElementById("protected-content");
    if (container) {
        container.innerHTML = `<div class="auth-error-notice">${message}</div>`;
    }
    setTimeout(() => {
        window.location.replace("login.html");
    }, 2000);
}
