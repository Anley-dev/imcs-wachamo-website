// IMCS Wachemo - Secure Administrative Console Engine
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, doc, getDoc, addDoc, getDocs, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const gateScreen = document.getElementById("admin-gate-loader");
    const mainWorkspace = document.getElementById("admin-main-workspace");
    const userEmailText = document.getElementById("admin-user-email");
    const eventForm = document.getElementById("admin-event-form");
    const liveFeedContainer = document.getElementById("admin-events-live-feed");

    // ==========================================
    // 1. LEVEL 1 ROLE-BASED ACCESS GATEKEEPER
    // ==========================================
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            alert("Access Denied: Unauthenticated attempt caught. Please sign in.");
            window.location.href = "login.html";
            return;
        }

        try {
            // Read security metadata flags straight from the users document tree
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
                console.log("Admin privileges verified for UID:", user.uid);
                userEmailText.innerHTML = `<i class="fas fa-user-shield"></i> ${user.email}`;
                
                // Lift security veil and build dashboard views
                gateScreen.classList.add("structural-hide");
                mainWorkspace.classList.remove("structural-hide");
                
                // Spin up live tracking monitors
                streamLiveEvents();
            } else {
                alert("Security Breach Alert: Your account token lacks active admin execution rules.");
                window.location.href = "index.html";
            }
        } catch (error) {
            console.error("RBAC Handshake Intercept Fault:", error);
            alert("Error validating system credentials. Returning to security terminal.");
            window.location.href = "index.html";
        }
    });

    // ==========================================
    // 2. DOCUMENT COMMIT GENERATION ENGINE
    // ==========================================
    if (eventForm) {
        eventForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = document.getElementById("event-title").value.trim();
            const date = document.getElementById("event-date").value;
            const time = document.getElementById("event-time").value.trim();
            const location = document.getElementById("event-location").value.trim();
            const category = document.getElementById("event-category").value;
            const description = document.getElementById("event-desc").value.trim();

            try {
                // Write transaction object payload directly into Cloud Firestore
                await addDoc(collection(db, "events"), {
                    title,
                    date,
                    time,
                    location,
                    category,
                    description,
                    createdAt: new Date().toISOString()
                });

                alert("Database Sync Complete: Event record published safely!");
                eventForm.reset();
                
                // Refresh dashboard feedback list tracking components
                streamLiveEvents();
            } catch (error) {
                console.error("Database Write Rejection Catch:", error);
                alert(`Transaction aborted: ${error.message}`);
            }
        });
    }

    // ==========================================
    // 3. TRACKING MONITOR LIST REFRESH CONTROLLER
    // ==========================================
    async function streamLiveEvents() {
        if (!liveFeedContainer) return;

        try {
            const eventsRef = collection(db, "events");
            const q = query(eventsRef, orderBy("date", "asc"));
            const snapshot = await getDocs(q);

            liveFeedContainer.innerHTML = "";

            if (snapshot.empty) {
                liveFeedContainer.innerHTML = `<p class="feed-empty-alert">No active event tracking records found in the firestore cluster.</p>`;
                return;
            }

            snapshot.forEach((docSnapshot) => {
                const data = docSnapshot.data();
                const id = docSnapshot.id;

                const feedItem = document.createElement("div");
                feedItem.className = "admin-feed-item";
                feedItem.innerHTML = `
                    <div class="feed-item-meta">
                        <strong>${data.title}</strong>
                        <span><i class="far fa-calendar-alt"></i> ${data.date}</span>
                    </div>
                    <button class="btn-delete-record" data-id="${id}"><i class="far fa-trash-can"></i> Purge</button>
                `;
                
                // Mount deletion target triggers directly inside our monitors loops
                feedItem.querySelector(".btn-delete-record").addEventListener("click", async (e) => {
                    if (confirm(`Destructive Action Alert: Are you certain you want to purge "${data.title}" from production clusters permanently?`)) {
                        await deleteDoc(doc(db, "events", id));
                        alert("Document eliminated from remote clusters.");
                        streamLiveEvents(); // Reload live monitors UI view
                    }
                });

                liveFeedContainer.appendChild(feedItem);
            });
        } catch (error) {
            console.error("Monitor tracking generation failure:", error);
            liveFeedContainer.innerHTML = `<p class="feed-error-text">Failed to stream active metrics.</p>`;
        }
    }
});

