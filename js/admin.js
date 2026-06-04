// IMCS Wachemo - Admin Panel Logic with Better Error Handling
console.log("📦 Loading Firebase SDK...");

// Initialize Firebase safely
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

    auth.onAuthStateChanged((user) => {
        if (!user) {
            console.warn("❌ Not authenticated, redirecting to login");
            window.location.href = "login.html";
        } else {
            console.log("✅ User authenticated:", user.email);
            loadPosts();
            loadEvents();
        }
    });

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

    const timeoutId = setTimeout(() => {
        messageDiv.innerHTML = "❌ Timeout: Firestore connection slow.";
        messageDiv.className = "message show error";
        btn.disabled = false;
        btn.style.opacity = "1";
    }, 15000); 

    db.collection("news").add({
        title: title,
        content: content,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        author: auth.currentUser?.email || "Anonymous"
    })
    .then(() => {
        clearTimeout(timeoutId);
        messageDiv.innerHTML = "✅ Post published successfully!";
        messageDiv.className = "message show success";

        document.getElementById("post-title").value = "";
        document.getElementById("post-content").value = "";

        setTimeout(() => {
            messageDiv.className = "message";
        }, 3000);
    })
    .catch((error) => {
        clearTimeout(timeoutId);
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

    const unsubscribe = db.collection("news")
        .orderBy("createdAt", "desc")
        .limit(50)
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
                            <button class="btn-edit" data-post-id="${doc.id}">✏️ Edit</button>
                            <button class="btn-delete" data-post-id="${doc.id}">🗑️ Delete</button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            container.querySelectorAll(".btn-edit").forEach(btn => {
                btn.addEventListener("click", () => editPost(btn.dataset.postId));
            });

            container.querySelectorAll(".btn-delete").forEach(btn => {
                btn.addEventListener("click", () => deletePost(btn.dataset.postId));
            });
        }, (error) => {
            container.innerHTML = `
                <div class="empty-state" style="background: #fee2e2; padding: 20px; color: #7f1d1d; border-radius: 8px;">
                    <p>❌ Error loading posts</p>
                    <p style="font-size: 0.9rem;">${error.message}</p>
                </div>
            `;
        });

    return unsubscribe;
}

function editPost(postId) {
    // Clear old data to prevent visual glitches
    document.getElementById("editPostTitle").value = "Loading...";
    document.getElementById("editPostContent").value = "Loading...";
    document.getElementById("editPostModal").classList.add("show");

    db.collection("news").doc(postId).get().then((doc) => {
        if (!doc.exists) {
            alert("Post not found!");
            closeEditPostModal();
            return;
        }
        const post = doc.data();
        currentEditPostId = postId;
        document.getElementById("editPostTitle").value = post.title || "";
        document.getElementById("editPostContent").value = post.content || "";
    }).catch((error) => {
        alert(`Error: ${error.message}`);
        closeEditPostModal();
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
    })
    .catch((error) => {
        alert(`❌ Error: ${error.message}`);
    });
}

function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    db.collection("news").doc(postId).delete()
    .catch((error) => {
        alert(`❌ Error: ${error.message}`);
    });
}

function closeEditPostModal() {
    document.getElementById("editPostModal").classList.remove("show");
    currentEditPostId = null;
}

// ============ EVENTS FUNCTIONS ============

function createEvent() {
    const titleInput = document.getElementById("event-title");
    const dateInput = document.getElementById("event-date");
    const timeInput = document.getElementById("event-time");
    const descInput = document.getElementById("event-desc");
    const messageDiv = document.getElementById("event-message");
    const btn = document.getElementById("eventBtn");

    const title = titleInput ? titleInput.value.trim() : "";
    const date = dateInput ? dateInput.value : "";
    const time = timeInput ? timeInput.value : "";
    const description = descInput ? descInput.value.trim() : "";

    if (!title || !date || !description) {
        if (messageDiv) {
            messageDiv.innerHTML = "❌ Please fill title, date, and description";
            messageDiv.className = "message show error";
        } else {
            alert("❌ Please fill title, date, and description");
        }
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.style.opacity = "0.6";
    }
    if (messageDiv) {
        messageDiv.innerHTML = "📤 Creating event...";
        messageDiv.className = "message show";
    }

    const timeoutId = setTimeout(() => {
        if (messageDiv) {
            messageDiv.innerHTML = "❌ Timeout: Connection slow.";
            messageDiv.className = "message show error";
        }
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = "1";
        }
    }, 15000);

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
        if (messageDiv) {
            messageDiv.innerHTML = "✅ Event created successfully!";
            messageDiv.className = "message show success";
        }

        if (titleInput) titleInput.value = "";
        if (dateInput) dateInput.value = "";
        if (timeInput) timeInput.value = "";
        if (descInput) descInput.value = "";

        setTimeout(() => {
            if (messageDiv) messageDiv.className = "message";
        }, 3000);
    })
    .catch((error) => {
        clearTimeout(timeoutId);
        if (messageDiv) {
            messageDiv.innerHTML = `❌ Error: ${error.message}`;
            messageDiv.className = "message show error";
        }
    })
    .finally(() => {
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = "1";
        }
    });
}

function loadEvents() {
    const container = document.getElementById("events-list");
    container.innerHTML = '⏳ Loading events...';

    const unsubscribe = db.collection("events")
        .orderBy("createdAt", "desc")
        .limit(50)
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
                            <button class="btn-edit" data-event-id="${doc.id}">✏️ Edit</button>
                            <button class="btn-delete" data-event-id="${doc.id}">🗑️ Delete</button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            container.querySelectorAll(".btn-edit").forEach(btn => {
                btn.addEventListener("click", () => editEvent(btn.dataset.eventId)); 
            });

            container.querySelectorAll(".btn-delete").forEach(btn => {
                btn.addEventListener("click", () => deleteEvent(btn.dataset.eventId)); 
            });
        }, (error) => {
            container.innerHTML = `
                <div class="empty-state" style="background: #fee2e2; padding: 20px; color: #7f1d1d; border-radius: 8px;">
                    <p>❌ Error loading events</p>
                    <p style="font-size: 0.9rem;">${error.message}</p>
                </div>
            `;
        });

    return unsubscribe;
}

function editEvent(eventId) {
    // Clear old data from the modal immediately so it doesn't show old text
    document.getElementById("editEventTitle").value = "Loading...";
    document.getElementById("editEventDate").value = "";
    document.getElementById("editEventTime").value = "";
    document.getElementById("editEventDesc").value = "Loading...";
    document.getElementById("editEventModal").classList.add("show");

    db.collection("events").doc(eventId).get().then((doc) => {
        if (!doc.exists) {
            alert("Event not found!");
            closeEditEventModal();
            return;
        }

        const event = doc.data();
        currentEditEventId = eventId;
        document.getElementById("editEventTitle").value = event.title || "";
        document.getElementById("editEventDate").value = event.date || "";
        document.getElementById("editEventTime").value = event.time || "";
        document.getElementById("editEventDesc").value = event.description || "";

    }).catch((error) => {
        alert(`Error: ${error.message}`);
        closeEditEventModal();
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
    })
    .catch((error) => {
        alert(`❌ Error: ${error.message}`);
    });
}

function deleteEvent(eventId) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    db.collection("events").doc(eventId).delete()
    .catch((error) => {
        alert(`❌ Error: ${error.message}`);
    });
}

function closeEditEventModal() {
    document.getElementById("editEventModal").classList.remove("show");
    currentEditEventId = null;
}

// ============ MEMBERS FUNCTIONS ============

async function loadMembers() {
    const container = document.getElementById("members-list");
    container.innerHTML = "🔍 Loading members...";

    try {
        // We use .get() instead of .onSnapshot() to avoid infinite loading if an error occurs
        let snapshot = await db.collection("members").limit(100).get();
        if (!snapshot.empty) return displayMembers(snapshot, container);

        snapshot = await db.collection("users").limit(100).get();
        if (!snapshot.empty) return displayMembers(snapshot, container);

        snapshot = await db.collection("authUsers").limit(100).get();
        if (!snapshot.empty) return displayMembers(snapshot, container);

        // If no errors, but no members were found
        container.innerHTML = `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; color: #92400e;">
                <p><strong>⚠️ No members found!</strong></p>
                <p style="font-size: 0.9rem;">Your database doesn't have any users yet, or they are in a different collection.</p>
            </div>
        `;

    } catch (error) {
        console.error("Error fetching members:", error);
        
        // This will now correctly show you if Firebase Rules are blocking access!
        container.innerHTML = `
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; color: #7f1d1d;">
                <p><strong>❌ Error Loading Members</strong></p>
                <p style="font-size: 0.9rem;">${error.message}</p>
                <p style="font-size: 0.85rem; margin-top: 5px;">*This usually means your Firestore Rules are blocking read access to the admin.*</p>
            </div>
        `;
    }
}

function displayMembers(snapshot, container) {
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
