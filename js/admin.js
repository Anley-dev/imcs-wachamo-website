// IMCS Wachemo - Admin Panel Logic with Deep Error Tracing
console.log("📦 Loading Firebase SDK...");

let db, auth;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp({
            apiKey: "AIzaSyCxD9h4BBPNbbuepLTEyQIesMj44eEqdNA",
            authDomain: "imcs-wachamo.firebaseapp.com",
            projectId: "imcs-wachamo",
            storageBucket: "imcs-wachamo.firebasestorage.app",
            messagingSenderId: "445125483030",
            appId: "1:445125483030:web:2eaa94ecac7a13ef0fb337"
        });
    }
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("✅ Firebase systems fully loaded");
} catch (error) {
    console.error("❌ Firebase initialization error:", error);
    alert("💥 Firebase failed to initialize: " + error.message);
}

let currentEditPostId = null;
let currentEditEventId = null;

// ============ INITIALIZATION ============
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    if (!auth) {
        alert("❌ Auth system is uninitialized. Check your CDN links.");
        return;
    }

    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
        } else {
            loadPosts();
            loadEvents();
            loadMembers(); // Added to make sure members load automatically on startup
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to logout?")) {
                try {
                    await auth.signOut();
                    window.location.href = "index.html";
                } catch (error) {
                    alert("Error signing out: " + error.message);
                }
            }
        });
    }
});

// ============ POSTS/NEWS FUNCTIONS ============
function publishPost() {
    const title = document.getElementById("post-title").value.trim();
    const content = document.getElementById("post-content").value.trim();
    const messageDiv = document.getElementById("post-message");
    const btn = document.getElementById("publishBtn");

    if (!title || !content) {
        messageDiv.innerHTML = "❌ Please fill both title and content";
        messageDiv.className = "message show error";
        return;
    }

    btn.disabled = true;
    messageDiv.innerHTML = "📤 Publishing...";
    messageDiv.className = "message show";

    db.collection("news").add({
        title: title,
        content: content,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        author: auth.currentUser?.email || "Anonymous"
    })
    .then(() => {
        messageDiv.innerHTML = "✅ Post published successfully!";
        messageDiv.className = "message show success";
        document.getElementById("post-title").value = "";
        document.getElementById("post-content").value = "";
        setTimeout(() => { messageDiv.className = "message"; }, 3000);
    })
    .catch((error) => {
        messageDiv.innerHTML = `❌ Error: ${error.message}`;
        messageDiv.className = "message show error";
        alert("Database Write Rejected: " + error.message);
    })
    .finally(() => { btn.disabled = false; });
}

function loadPosts() {
    const container = document.getElementById("posts-container");
    db.collection("news").orderBy("createdAt", "desc").limit(50).onSnapshot((snapshot) => {
        if (snapshot.empty) {
            container.innerHTML = '<p>No posts published yet.</p>';
            return;
        }
        let html = "";
        snapshot.forEach((doc) => {
            const post = doc.data();
            const date = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString() : "Recent";
            html += `
                <div class="post-item">
                    <h4>${escapeHtml(post.title)}</h4>
                    <small>📅 ${date}</small>
                    <p>${escapeHtml(post.content)}</p>
                    <div class="item-actions">
                        <button class="btn-edit" data-post-id="${doc.id}">✏️ Edit</button>
                        <button class="btn-delete" data-post-id="${doc.id}">🗑️ Delete</button>
                    </div>
                </div>`;
        });
        container.innerHTML = html;
        container.querySelectorAll(".btn-edit").forEach(b => b.addEventListener("click", () => editPost(b.dataset.postId)));
        container.querySelectorAll(".btn-delete").forEach(b => b.addEventListener("click", () => deletePost(b.dataset.postId)));
    }, (err) => {
        container.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    });
}

function editPost(postId) {
    document.getElementById("editPostTitle").value = "Loading...";
    document.getElementById("editPostContent").value = "Loading...";
    document.getElementById("editPostModal").classList.add("show");

    db.collection("news").doc(postId).get().then((doc) => {
        if (!doc.exists) return closeEditPostModal();
        const post = doc.data();
        currentEditPostId = postId;
        document.getElementById("editPostTitle").value = post.title || "";
        document.getElementById("editPostContent").value = post.content || "";
    }).catch(err => alert("Fetch error: " + err.message));
}

// Fixed to handle the window/modal interface elements gracefully
function saveEditPost() {
    if (!currentEditPostId) return;
    db.collection("news").doc(currentEditPostId).update({
        title: document.getElementById("editPostTitle").value.trim(),
        content: document.getElementById("editPostContent").value.trim()
    }).then(() => { closeEditPostModal(); }).catch(err => alert("Update failed: " + err.message));
}

function deletePost(postId) {
    if (confirm("Delete this post?")) db.collection("news").doc(postId).delete().catch(err => alert(err.message));
}

function closeEditPostModal() {
    document.getElementById("editPostModal").classList.remove("show");
    currentEditPostId = null;
}

// ============ EVENTS FUNCTIONS ============
function createEvent() {
    try {
        if (!db) { alert("💥 Database is offline!"); return; }

        const title = document.getElementById("event-title").value.trim();
        const date = document.getElementById("event-date").value;
        const time = document.getElementById("event-time").value;
        const description = document.getElementById("event-desc").value.trim();
        const messageDiv = document.getElementById("event-message");
        const btn = document.getElementById("eventBtn");

        if (!title || !date || !description) {
            alert("⚠️ Missing fields! Title, Date, and Description are required.");
            return;
        }

        btn.disabled = true;
        messageDiv.innerHTML = "📤 Synchronizing with Firestore...";
        messageDiv.className = "message show";

        db.collection("events").add({
            title: title,
            date: date,
            time: time || "",
            description: description,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            author: auth.currentUser?.email || "Anonymous"
        })
        .then(() => {
            messageDiv.innerHTML = "✅ Event created successfully!";
            messageDiv.className = "message show success";
            document.getElementById("event-title").value = "";
            document.getElementById("event-date").value = "";
            document.getElementById("event-time").value = "";
            document.getElementById("event-desc").value = "";
            setTimeout(() => { messageDiv.className = "message"; }, 3000);
        })
        .catch((error) => {
            messageDiv.innerHTML = `❌ Write Blocked: ${error.message}`;
            messageDiv.className = "message show error";
            alert("🛑 Firebase Database Error:\n" + error.message + "\n\nVerify your Security Rules allow document writes.");
        })
        .finally(() => { btn.disabled = false; });

    } catch (e) {
        alert("JavaScript Execution Crash: " + e.message);
    }
}

function loadEvents() {
    const container = document.getElementById("events-list");
    db.collection("events").orderBy("createdAt", "desc").limit(50).onSnapshot((snapshot) => {
        if (snapshot.empty) {
            container.innerHTML = '<p>No events registered.</p>';
            return;
        }
        let html = "";
        snapshot.forEach((doc) => {
            const event = doc.data();
            const createdDate = event.createdAt ? new Date(event.createdAt.toDate()).toLocaleString() : "Recent";
            const displayTime = event.time ? ` at ${event.time}` : "";
            html += `
                <div class="event-item">
                    <h4>${escapeHtml(event.title)}</h4>
                    <small>📅 ${event.date}${displayTime}</small>
                    <p>${escapeHtml(event.description || event.desc)}</p>
                    <div class="item-actions">
                        <button class="btn-edit" data-event-id="${doc.id}">✏️ Edit</button>
                        <button class="btn-delete" data-event-id="${doc.id}">🗑️ Delete</button>
                    </div>
                </div>`;
        });
        container.innerHTML = html;
        container.querySelectorAll(".btn-edit").forEach(b => b.addEventListener("click", () => editEvent(b.dataset.eventId)));
        container.querySelectorAll(".btn-delete").forEach(b => b.addEventListener("click", () => deleteEvent(b.dataset.eventId)));
    }, (err) => {
        container.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    });
}

function editEvent(eventId) {
    document.getElementById("editEventTitle").value = "Loading...";
    document.getElementById("editEventDesc").value = "Loading...";
    document.getElementById("editEventModal").classList.add("show");

    db.collection("events").doc(eventId).get().then((doc) => {
        if (!doc.exists) return closeEditEventModal();
        const event = doc.data();
        currentEditEventId = eventId;
        document.getElementById("editEventTitle").value = event.title || "";
        document.getElementById("editEventDate").value = event.date || "";
        document.getElementById("editEventTime").value = event.time || "";
        document.getElementById("editEventDesc").value = event.description || event.desc || "";
    }).catch(err => alert("Fetch error: " + err.message));
}

function saveEditEvent() {
    if (!currentEditEventId) return;
    
    const title = document.getElementById("editEventTitle").value.trim();
    const date = document.getElementById("editEventDate").value;
    const time = document.getElementById("editEventTime").value;
    const description = document.getElementById("editEventDesc").value.trim(); // Fixed: pointing to editEventDesc matches template logic

    if (!title || !date || !description) {
        alert("⚠️ All fields are required to update this event.");
        return;
    }

    db.collection("events").doc(currentEditEventId).update({
        title: title,
        date: date,
        time: time || "",
        description: description
    })
    .then(() => { closeEditEventModal(); })
    .catch(err => alert("Update failed: " + err.message));
}

function deleteEvent(eventId) {
    if (confirm("Delete this event permanently?")) db.collection("events").doc(eventId).delete().catch(err => alert(err.message));
}

function closeEditEventModal() {
    document.getElementById("editEventModal").classList.remove("show");
    currentEditEventId = null;
}

// ============ MEMBERS FUNCTIONS ============
async function loadMembers() {
    const container = document.getElementById("members-list");
    if (!container) return; // Prevent crashes if element isn't in current view
    container.innerHTML = "🔍 Loading member directories...";

    try {
        let snapshot = await db.collection("members").limit(50).get();
        if (!snapshot.empty) return displayMembers(snapshot, container);

        snapshot = await db.collection("users").limit(50).get();
        if (!snapshot.empty) return displayMembers(snapshot, container);

        snapshot = await db.collection("authUsers").limit(50).get();
        if (!snapshot.empty) return displayMembers(snapshot, container);

        container.innerHTML = `<p>⚠️ Directory paths empty. No user profiles detected.</p>`;
    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; color: #7f1d1d;">
                <p><strong>❌ Directory Read Access Denied</strong></p>
                <p style="font-size: 0.9rem;">${error.message}</p>
            </div>`;
    }
}

function displayMembers(snapshot, container) {
    let html = "<table style='width:100%; border-collapse: collapse;'>";
    html += "<tr style='background: #f3f4f6;'><th style='padding:10px; text-align:left;'>Name</th><th style='padding:10px; text-align:left;'>Email</th></tr>";
    snapshot.forEach((doc) => {
        const m = doc.data();
        html += `<tr style='border-bottom:1px solid #ddd;'><td style='padding:10px;'>${escapeHtml(m.name || m.username || 'N/A')}</td><td style='padding:10px;'>${escapeHtml(m.email || 'N/A')}</td></tr>`;
    });
    html += "</table>";
    container.innerHTML = html;
}

function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
