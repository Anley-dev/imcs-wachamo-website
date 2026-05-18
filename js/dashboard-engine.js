import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

class DashboardEngine {
    constructor() {
        this.auth = getAuth();
        this.db = getFirestore();
        this.slots = {
            spiritual: document.getElementById('spiritual-view-slot'),
            formations: document.getElementById('formations-view-slot'),
            announcements: document.getElementById('announcements-view-slot')
        };
        this.initListeners();
    }

    initListeners() {
        // Global Single-Page Signout Hook
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleTermination());
        }
    }

    injectSkeletons() {
        Object.values(this.slots).forEach(slot => {
            if (slot) {
                slot.innerHTML = `
                    <div class="skeleton-loader"></div>
                    <div class="skeleton-loader"></div>
                    <div class="skeleton-loader"></div>
                `;
            }
        });
    }

    async bootSyncPipelines() {
        this.injectSkeletons();
        
        // Parallel non-blocking execution threads across database paths
        await Promise.allSettled([
            this.syncSpiritualEngine(),
            this.syncFormationsEngine(),
            this.syncAnnouncementsEngine()
        ]);
    }

    async syncSpiritualEngine() {
        try {
            const q = query(collection(this.db, "spiritual_programs"), orderBy("date", "desc"), limit(5));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                this.slots.spiritual.innerHTML = this.buildEmptyUI("No active operations scheduled.");
                return;
            }

            this.slots.spiritual.innerHTML = snapshot.docs.map(doc => {
                const data = doc.data();
                return `
                    <div class="view-node">
                        <div class="node-meta">
                            <h4>${this.sanitize(data.title)}</h4>
                            <span>${new Date(data.date).toLocaleDateString()} &bull; ${this.sanitize(data.type)}</span>
                        </div>
                        <i class="fas fa-chevron-right text-muted"></i>
                    </div>
                `;
            }).join('');
        } catch (err) {
            this.handlePipelineFailure(this.slots.spiritual, err);
        }
    }

    async syncFormationsEngine() {
        try {
            const q = query(collection(this.db, "resources"), orderBy("uploadedAt", "desc"), limit(5));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                this.slots.formations.innerHTML = this.buildEmptyUI("Assets empty.");
                return;
            }

            this.slots.formations.innerHTML = snapshot.docs.map(doc => {
                const data = doc.data();
                return `
                    <div class="view-node">
                        <div class="node-meta">
                            <h4>${this.sanitize(data.title)}</h4>
                            <span>File Size: ${this.sanitize(data.size || 'N/A')}</span>
                        </div>
                        <a href="${data.downloadUrl}" class="text-green" downloadaria-label="Download ${this.sanitize(data.title)}">
                            <i class="fas fa-cloud-download-alt fa-lg"></i>
                        </a>
                    </div>
                `;
            }).join('');
        } catch (err) {
            this.handlePipelineFailure(this.slots.formations, err);
        }
    }

    async syncAnnouncementsEngine() {
        try {
            const q = query(collection(this.db, "announcements"), orderBy("timestamp", "desc"), limit(3));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                this.slots.announcements.innerHTML = this.buildEmptyUI("Clear notifications log.");
                return;
            }

            this.slots.announcements.innerHTML = snapshot.docs.map(doc => {
                const data = doc.data();
                const isUrgent = data.priority === "high";
                return `
                    <div class="view-node" style="${isUrgent ? 'border-left: 3px solid var(--orange-base);' : ''}">
                        <div class="node-meta">
                            <h4 style="${isUrgent ? 'font-weight:600; color:var(--orange-base);' : ''}">${this.sanitize(data.title)}</h4>
                            <span style="display:block; margin-bottom:4px;">${this.sanitize(data.content)}</span>
                            <span>${new Date(data.timestamp?.toDate()).toLocaleDateString()}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            this.handlePipelineFailure(this.slots.announcements, err);
        }
    }

    buildEmptyUI(message) {
        return `<div style="text-align:center; margin:auto; color:var(--text-muted); font-size:0.875rem;">${message}</div>`;
    }

    handlePipelineFailure(slot, err) {
        console.error("Data-Layer pipeline drop out:", err);
        slot.innerHTML = `<div style="color:red; font-size:0.8rem;"><i class="fas fa-exclamation-triangle"></i> Stream disconnect.</div>`;
    }

    sanitize(string) {
        const temp = document.createElement('div');
        temp.textContent = string;
        return temp.innerHTML;
    }

    handleTermination() {
        signOut(this.auth).then(() => {
            window.location.replace("login.html");
        }).catch(err => console.error("Signout block error:", err));
    }
}

// Global Core Access Gateway Hook
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
    const frame = document.getElementById("protected-content");
    if (user) {
        if (frame) {
            frame.classList.remove("auth-gate-locked");
            frame.classList.add("auth-gate-unlocked");
            frame.removeAttribute("aria-hidden");
        }
        // Initialize Core View Engine
        const app = new DashboardEngine();
        app.bootSyncPipelines();
    } else {
        window.location.replace("login.html");
    }
});

