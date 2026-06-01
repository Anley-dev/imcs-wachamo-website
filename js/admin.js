// IMCS Wachemo - Admin Panel Logic
// Firebase imports
const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCxD9h4BBPNbbuepLTEyQIesMj44eEqdNA",
    authDomain: "imcs-wachamo.firebaseapp.com",
    projectId: "imcs-wachamo",
    storageBucket: "imcs-wachamo.firebasestorage.app",
    messagingSenderId: "445125483030",
    appId: "1:445125483030:web:2eaa94ecac7a13ef0fb337"
});

const db = firebase.firestore();
const auth = firebase.auth();

// Global state
let currentEditPostId = null;
let currentEditEventId = null;

// ============ INITIALIZATION ============
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    // Auth Protection
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
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

    // Load existing posts and events
    loadPosts();
    loadEvents();
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

    db.collection("news").add({
        title: title,
        content: content,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        author: auth.currentUser?.email || "Anonymous"
    })
    .then(() => {
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
        console.error("Error publishing post:", error);
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
    
    db.collection("news")
        .orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {
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
                            <button class="btn-edit" onclick="editPost('${doc.id}')">✏️ Edit</button>
                            <button class="btn-delete" onclick="deletePost('${doc.id}')">🗑️ Delete</button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }, (error) => {
            console.error("Error loading posts:", error);
            container.innerHTML = '<div class="empty-state"><p>❌ Error loading posts</p></div>';
        });
}

function editPost(postId) {
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

    db.collection("news").doc(currentEditPostId).update({
        title: title,
        content: content
    })
    .then(() => {
        alert("✅ Post updated successfully!");
        closeEditPostModal();
        loadPosts();
    })
    .catch((error) => {
        console.error("Error updating post:", error);
        alert(`❌ Error: ${error.message}`);
    });
}

function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    db.collection("news").doc(postId).delete()
    .then(() => {
        alert("✅ Post deleted!");
        loadPosts();
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
    
    db.collection("events")
        .orderBy("createdAt", "desc")
        .onSnapshot((snapshot) => {
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
                            <button class="btn-edit" onclick="editEvent('${doc.id}')">✏️ Edit</button>
                            <button class="btn-delete" onclick="deleteEvent('${doc.id}')">🗑️ Delete</button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }, (error) => {
            console.error("Error loading events:", error);
            container.innerHTML = '<div class="empty-state"><p>❌ Error loading events</p></div>';
        });
}

function editEvent(eventId) {
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

    db.collection("events").doc(currentEditEventId).update({
        title: title,
        date: date,
        time: time || "",
        description: description
    })
    .then(() => {
        alert("✅ Event updated successfully!");
        closeEditEventModal();
        loadEvents();
    })
    .catch((error) => {
        console.error("Error updating event:", error);
        alert(`❌ Error: ${error.message}`);
    });
}

function deleteEvent(eventId) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    db.collection("events").doc(eventId).delete()
    .then(() => {
        alert("✅ Event deleted!");
        loadEvents();
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
    
    // Try 'members' collection first
    db.collection("members").onSnapshot((snapshot) => {
        if (!snapshot.empty) {
            displayMembers(snapshot, container);
            return;
        }
        
        // Try 'users' collection
        db.collection("users").onSnapshot((snapshot2) => {
            if (!snapshot2.empty) {
                displayMembers(snapshot2, container);
                return;
            }
            
            // Try 'authUsers' collection
            db.collection("authUsers").onSnapshot((snapshot3) => {
                if (!snapshot3.empty) {
                    displayMembers(snapshot3, container);
                } else {
                    container.innerHTML = `
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; color: #92400e;">
                            <p><strong>⚠️ No members found!</strong></p>
                            <p>Create a 'members' collection in Firebase</p>
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

// Close modals
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
