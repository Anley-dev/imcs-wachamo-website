// IMCS Wachemo - Admin Panel Logic with Better Error Handling
console.log("📦 Loading Firebase SDK...");

// Initialize Firebase safely (check if already initialized)
let db, auth;

try {
    if (!firebase.apps.length) {
        const firebaseApp = firebase.initializeApp({
            apiKey: "AIzaSyCxD9h4BBPNbbuepLTEyQIesMj44eEqdNA",
            authDomain: "imcs-wachamo.firebaseapp.com",
            projectId: "imcs-wachamo",
            storageBucket: "imcs-wachamo.firebasestorage.app",
            messagingSenderId: "445125483030",
            appId: "1:445125483030:web:2eaa94ecac7a13ef0fb337"
        });
        db = firebase.firestore();
        auth = firebase.auth();
    } else {
        db = firebase.firestore();
        auth = firebase.auth();
    }
    console.log("✅ Firebase initialized");
} catch (error) {
    console.error("❌ Firebase initialization error:", error);
}

// Global state
let currentEditPostId = null;
let currentEditEventId = null;

// ============ INITIALIZATION ============
document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 DOM loaded, initializing admin panel...");

    const logoutBtn = document.getElementById("logoutBtn");

    // Auth Protection
    auth.onAuthStateChanged((user) => {
        if (!user) {
            console.warn("❌ Not authenticated, redirecting to login");
            window.location.href = "login.html";
        } else {
            console.log("✅ User authenticated:", user.email);
            // Load existing posts and events
            loadPosts();
            loadEvents();
        }
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to logout?")) {
                try {
                    await auth.signOut();
                    window.location.href = "index.html";
                } catch (error) {
                    console.error("Logout error:", error);
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
    btn.style.opacity = "0.6";
    messageDiv.innerHTML = "📤 Publishing...";
    messageDiv.className = "message show";

    console.log("📝 Publishing post to Firestore...");

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
        console.error("❌ Firestore timeout - taking too long to publish");
        messageDiv.innerHTML = "❌ Timeout: Firestore connection slow. Check your internet or Firebase permissions.";
        messageDiv.className = "message show error";
        btn.disabled = false;
        btn.style.opacity = "1";
    }, 15000); // 15 second timeout

    db.collection("news").add({
        title: title,
        content: content,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        author: auth.currentUser?.email || "Anonymous"
    })
    .then(() => {
        clearTimeout(timeoutId);
        console.log("✅ Post published successfully!");
        messageDiv.innerHTML = "✅ Post published successfully!";
        messageDiv.className = "message show success";

        // Clear form
        document.getElementById("post-title").value = "";
        document.getElementById("post-content").value = "";

        setTimeout(() => {
            messageDiv.className = "message";
        }, 3000);

        // Reload posts
        loadPosts();
    })
    .catch((error) => {
        clearTimeout(timeoutId);
        console.error("❌ Error publishing post:", error);
        messageDiv.innerHTML = `❌ Error: ${error.message}`;
        messageDiv.className = "message show error";
    })
    .finally(() => {
        btn.disabled = false;
        btn.style.opacity = "1";
    });
}

function loadPosts() {
    const container = document.getElementById("posts-container");
    container.innerHTML = '⏳ Loading posts...';

    console.log("📥 Fetching posts from Firestore...");

    const unsubscribe = db.collection("news")
        .orderBy("createdAt", "desc")
        .limit(50)
        .onSnapshot((snapshot) => {
            console.log(`📊 Loaded ${snapshot.size} posts`);

            if (snapshot.empty) {
                container.innerHTML = '<div class="empty-state"><p>No posts published yet.</p></div>';
                return;
            }

            let html = "";
            snapshot.forEach((doc) => {
                const post = doc.data();
                const date = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString() : "Recent";

                html += `
                    <div class="post-item">
                        <h4 style="margin: 0 0 8px 0;">${escapeHtml(post.title)}</h4>
                        <small style="color: #6b7280;">📅 ${date}</small>
                        <p style="margin: 10px 0; color: #374151;">${escapeHtml(post.content)}</p>
                        <div class="item-actions">
                            <button class="btn-edit" data-post-id="${doc.id}">✏️ Edit</button>
                            <button class="btn-delete" data-post-id="${doc.id}">🗑️ Delete</button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            // Add event listeners to dynamically created buttons
            container.querySelectorAll(".btn-edit").forEach(btn => {
                btn.addEventListener("click", () => editPost(btn.dataset.postId));
            });

            container.querySelectorAll(".btn-delete").forEach(btn => {
                btn.addEventListener("click", () => deletePost(btn.dataset.postId));
            });
        }, (error) => {
            console.error("❌ Error loading posts:", error);
            container.innerHTML = `
                <div class="empty-state" style="background: #fee2e2; padding: 20px; color: #7f1d1d; border-radius: 8px;">
                    <p>❌ Error loading posts</p>
                    <p style="font-size: 0.9rem;">${error.message}</p>
                    <p style="font-size: 0.85rem; margin-top: 10px;">Check browser console (F12) for details</p>
                </div>
            `;
        });

    // Return unsubscribe function (optional cleanup)
    return unsubscribe;
}

function editPost(postId) {
    console.log("✏️ Editing post:", postId);

    db.collection("news").doc(postId).get().then((doc) => {
        if (!doc.exists) {
            alert("Post not found!");
            return;
        }

        const post = doc.data();
        currentEditPostId = postId;
        document.getElementById("editPostTitle").value = post.title;
        document.getElementById("editPostContent").value = post.content;
        document.getElementById("editPostModal").classList.add("show");

    }).catch((error) => {
        console.error("Error editing post:", error);
        alert(`Error: ${error.message}`);
    });
}

function saveEditPost() {
    if (!currentEditPostId) return;

    const title = document.getElementById("editPostTitle").value.trim();
    const content = document.getElementById("editPostContent").value.trim();

    if (!title || !content) {
        alert("❌ Please fill in all fields");
        return;
    }

    console.log("💾 Saving post edits...");

    db.collection("news").doc(currentEditPostId).update({
        title: title,
        content: content
    })
    .then(() => {
        console.log("✅ Post updated!");
        alert("✅ Post updated successfully!");
        closeEditPostModal();
    })
    .catch((error) => {
        console.error("Error updating post:", error);
        alert(`❌ Error: ${error.message}`);
    });
}

function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    console.log("🗑️ Deleting post:", postId);

    db.collection("news").doc(postId).delete()
    .then(() => {
        console.log("✅ Post deleted!");
        alert("✅ Post deleted!");
    })
    .catch((error) => {
        console.error("Error deleting post:", error);
        alert(`❌ Error: ${error.message}`);
    });
}

function closeEditPostModal() {
    document.getElementById("editPostModal").classList.remove("show");
    currentEditPostId = null;
}

// ============ EVENTS FUNCTIONS ============

function createEvent() {
    const title = document.getElementById("event-title").value.trim();
    const date = document.getElementById("event-date").value;
    const time = document.getElementById("event-time").value;
    const description = document.getElementById("event-desc").value.trim();
    const messageDiv = document.getElementById("event-message");
    const btn = document.getElementById("eventBtn");

    if (!title || !date || !description) {
        messageDiv.innerHTML = "❌ Please fill title, date, and description";
        messageDiv.className = "message show error";
        return;
    }

    btn.disabled = true;
    btn.style.opacity = "0.6";
    messageDiv.innerHTML = "📤 Creating...";
    messageDiv.className = "message show";

    console.log("📝 Creating event in Firestore...");

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
        console.error("❌ Firestore timeout - taking too long to create event");
        messageDiv.innerHTML = "❌ Timeout: Firestore connection slow. Check your internet or Firebase permissions.";
        messageDiv.className = "message show error";
        btn.disabled = false;
        btn.style.opacity = "1";
    }, 15000); // 15 second timeout

    db.collection("events").add({
        title: title,
        date: date,
        time: time || "",
        description: description,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        author: auth.currentUser?.email || "Anonymous"
    })
    .then(() => {
        clearTimeout(timeoutId);
        console.log("✅ Event created successfully!");
        messageDiv.innerHTML = "✅ Event created successfully!";
        messageDiv.className = "message show success";

        // Clear form
        document.getElementById("event-title").value = "";
        document.getElementById("event-date").value = "";
        document.getElementById("event-time").value = "";
        document.getElementById("event-desc").value = "";

        setTimeout(() => {
            messageDiv.className = "message";
        }, 3000);

        // Reload events
        loadEvents();
    })
    .catch((error) => {
        clearTimeout(timeoutId);
        console.error("Error creating event:", error);
        messageDiv.innerHTML = `❌ Error: ${error.message}`;
        messageDiv.className = "message show error";
    })
    .finally(() => {
        btn.disabled = false;
        btn.style.opacity = "1";
    });
}

function loadEvents() {
    const container = document.getElementById("events-list");
    container.innerHTML = '⏳ Loading events...';

    console.log("📥 Fetching events from Firestore...");

    const unsubscribe = db.collection("events")
        .orderBy("createdAt", "desc")
        .limit(50)
        .onSnapshot((snapshot) => {
            console.log(`📊 Loaded ${snapshot.size} events`);

            if (snapshot.empty) {
                container.innerHTML = '<div class="empty-state"><p>No events created yet.</p></div>';
                return;
            }

            let html = "";
            snapshot.forEach((doc) => {
                const event = doc.data();
                const createdDate = event.createdAt ? new Date(event.createdAt.toDate()).toLocaleString() : "Recent";
                const displayTime = event.time ? ` at ${event.time}` : "";

                html += `
                    <div class="event-item">
                        <h4 style="margin: 0 0 8px 0;">${escapeHtml(event.title)}</h4>
                        <small style="color: #6b7280;">📅 ${event.date}${displayTime}</small>
                        <p style="margin: 10px 0; color: #374151;">${escapeHtml(event.description)}</p>
                        <small style="color: #9ca3af;">Created ${createdDate}</small>
                        <div class="item-actions">
                            <button class="btn-edit" data-event-id="${doc.id}">✏️ Edit</button>
                            <button class="btn-delete" data-event-id="${doc.id}">🗑️ Delete</button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            // Add event listeners to dynamically created buttons
            container.querySelectorAll(".btn-edit").forEach(btn => {
                btn.addEventListener("click", () => editEvent(btn.dataset.postId));
            });

            container.querySelectorAll(".btn-delete").forEach(btn => {
                btn.addEventListener("click", () => deleteEvent(btn.dataset.postId));
            });
        }, (error) => {
            console.error("❌ Error loading events:", error);
            container.innerHTML = `
                <div class="empty-state" style="background: #fee2e2; padding: 20px; color: #7f1d1d; border-radius: 8px;">
                    <p>❌ Error loading events</p>
                    <p style="font-size: 0.9rem;">${error.message}</p>
                    <p style="font-size: 0.85rem; margin-top: 10px;">Check browser console (F12) for details</p>
                </div>
            `;
        });

    return unsubscribe;
}

function editEvent(eventId) {
    console.log("✏️ Editing event:", eventId);

    db.collection("events").doc(eventId).get().then((doc) => {
        if (!doc.exists) {
            alert("Event not found!");
            return;
        }

        const event = doc.data();
        currentEditEventId = eventId;
        document.getElementById("editEventTitle").value = event.title;
        document.getElementById("editEventDate").value = event.date;
        document.getElementById("editEventTime").value = event.time || "";
        document.getElementById("editEventDesc").value = event.description;
        document.getElementById("editEventModal").classList.add("show");

    }).catch((error) => {
        console.error("Error editing event:", error);
        alert(`Error: ${error.message}`);
    });
}

function saveEditEvent() {
    if (!currentEditEventId) return;

    const title = document.getElementById("editEventTitle").value.trim();
    const date = document.getElementById("editEventDate").value;
    const time = document.getElementById("editEventTime").value;
    const description = document.getElementById("editEventDesc").value.trim();

    if (!title || !date || !description) {
        alert("❌ Please fill in all required fields");
        return;
    }

    console.log("💾 Saving event edits...");

    db.collection("events").doc(currentEditEventId).update({
        title: title,
        date: date,
        time: time || "",
        description: description
    })
    .then(() => {
        console.log("✅ Event updated!");
        alert("✅ Event updated successfully!");
        closeEditEventModal();
    })
    .catch((error) => {
        console.error("Error updating event:", error);
        alert(`❌ Error: ${error.message}`);
    });
}

function deleteEvent(eventId) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    console.log("🗑️ Deleting event:", eventId);

    db.collection("events").doc(eventId).delete()
    .then(() => {
        console.log("✅ Event deleted!");
        alert("✅ Event deleted!");
    })
    .catch((error) => {
        console.error("Error deleting event:", error);
        alert(`❌ Error: ${error.message}`);
    });
}

function closeEditEventModal() {
    document.getElementById("editEventModal").classList.remove("show");
    currentEditEventId = null;
}

// ============ MEMBERS FUNCTIONS ============

function loadMembers() {
    const container = document.getElementById("members-list");
    container.innerHTML = "🔍 Loading members...";

    console.log("👥 Loading members...");

    // Try 'members' collection first
    db.collection("members").limit(100).onSnapshot((snapshot) => {
        if (!snapshot.empty) {
            console.log(`✅ Found ${snapshot.size} members in 'members' collection`);
            displayMembers(snapshot, container);
            return;
        }

        console.log("⚠️ 'members' collection empty, trying 'users'...");

        // Try 'users' collection
        db.collection("users").limit(100).onSnapshot((snapshot2) => {
            if (!snapshot2.empty) {
                console.log(`✅ Found ${snapshot2.size} users in 'users' collection`);
                displayMembers(snapshot2, container);
                return;
            }

            console.log("⚠️ 'users' collection empty, trying 'authUsers'...");

            // Try 'authUsers' collection
            db.collection("authUsers").limit(100).onSnapshot((snapshot3) => {
                if (!snapshot3.empty) {
                    console.log(`✅ Found ${snapshot3.size} users in 'authUsers' collection`);
                    displayMembers(snapshot3, container);
                } else {
                    console.error("❌ No members found in any collection!");
                    container.innerHTML = `
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; color: #92400e;">
                            <p><strong>⚠️ No members found!</strong></p>
                            <p>No data in 'members', 'users', or 'authUsers' collections.</p>
                            <p>Create a 'members' collection in Firebase with documents containing: name, email, position</p>
                        </div>
                    `;
                }
            });
        });
    });
}

function displayMembers(snapshot, container) {
    if (snapshot.empty) {
        container.innerHTML = "<p>No members found.</p>";
        return;
    }

    let html = "<div style='overflow-x: auto;'><table style='width:100%; border-collapse: collapse;'>";
    html += "<tr style='background: #f3f4f6;'>";
    html += "<th style='padding:12px; text-align:left; border-bottom: 2px solid #ddd;'>Name</th>";
    html += "<th style='padding:12px; text-align:left; border-bottom: 2px solid #ddd;'>Email</th>";
    html += "<th style='padding:12px; text-align:left; border-bottom: 2px solid #ddd;'>Position</th>";
    html += "</tr>";

    snapshot.forEach((doc) => {
        const member = doc.data();
        html += `
            <tr style='border-bottom: 1px solid #ddd;'>
                <td style='padding:12px;'>${escapeHtml(member.name || 'N/A')}</td>
                <td style='padding:12px;'>${escapeHtml(member.email || 'N/A')}</td>
                <td style='padding:12px;'>${escapeHtml(member.position || 'N/A')}</td>
            </tr>
        `;
    });
    html += "</table></div>";
    container.innerHTML = html;
}

// ============ HELPER FUNCTIONS ============

function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("show");
}

window.onclick = function(event) {
    const postModal = document.getElementById("editPostModal");
    const eventModal = document.getElementById("editEventModal");

    if (event.target === postModal) {
        postModal.classList.remove("show");
    }
    if (event.target === eventModal) {
        eventModal.classList.remove("show");
    }
};

console.log("✅ Admin.js loaded successfully!");
