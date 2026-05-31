// IMCS Wachemo - Professional Admin Panel Logic
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCxD9h4BBPNbbuepLTEyQIesMj44eEqdNA",
    authDomain: "imcs-wachamo.firebaseapp.com",
    projectId: "imcs-wachamo",
    storageBucket: "imcs-wachamo.firebasestorage.app",
    messagingSenderId: "445125483030",
    appId: "1:445125483030:web:2eaa94ecac7a13ef0fb337"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Global state
let currentEditPostId = null;
let currentEditEventId = null;

// ============ INITIALIZATION ============
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    // Auth Protection
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
        }
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to logout?")) {
                try {
                    await signOut(auth);
                    window.location.href = "index.html";
                } catch (error) {
                    console.error("Logout error:", error);
                }
            }
        });
    }

    // Load existing posts and events
    loadPostsInitial();
    loadEventsInitial();
});

// ============ POSTS/NEWS FUNCTIONS ============

window.publishPost = async function() {
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

    try {
        await addDoc(collection(db, "news"), {
            title: title,
            content: content,
            createdAt: serverTimestamp(),
            author: auth.currentUser?.email || "Anonymous"
        });

        messageDiv.innerHTML = "✅ Post published successfully!";
        messageDiv.className = "message show success";

        // Clear form
        document.getElementById("post-title").value = "";
        document.getElementById("post-content").value = "";

        setTimeout(() => {
            messageDiv.className = "message";
        }, 3000);

        // Reload posts
        loadPostsInitial();

    } catch (error) {
        console.error("Error publishing post:", error);
        messageDiv.innerHTML = `❌ Error: ${error.message}`;
        messageDiv.className = "message show error";
    } finally {
        btn.disabled = false;
        btn.style.opacity = "1";
    }
};

function loadPostsInitial() {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const container = document.getElementById("posts-container");

    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>No posts published yet.</p></div>';
            return;
        }

        let html = "";
        snapshot.forEach((docSnap) => {
            const post = docSnap.data();
            const date = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString() : "Recent";

            html += `
                <div class="post-item">
                    <h4 style="margin: 0 0 8px 0;">${escapeHtml(post.title)}</h4>
                    <small style="color: #6b7280;">📅 ${date}</small>
                    <p style="margin: 10px 0; color: #374151;">${escapeHtml(post.content)}</p>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="editPost('${docSnap.id}')">✏️ Edit</button>
                        <button class="btn-delete" onclick="deletePost('${docSnap.id}')">🗑️ Delete</button>
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

window.editPost = async function(postId) {
    try {
        const docSnap = await getDocs(query(collection(db, "news")));
        let postData = null;

        docSnap.forEach(doc => {
            if (doc.id === postId) {
                postData = { id: doc.id, ...doc.data() };
            }
        });

        if (!postData) {
            alert("Post not found!");
            return;
        }

        currentEditPostId = postId;
        document.getElementById("editPostTitle").value = postData.title;
        document.getElementById("editPostContent").value = postData.content;
        document.getElementById("editPostModal").classList.add("show");

    } catch (error) {
        console.error("Error editing post:", error);
        alert(`Error: ${error.message}`);
    }
};

window.saveEditPost = async function() {
    if (!currentEditPostId) return;

    const title = document.getElementById("editPostTitle").value.trim();
    const content = document.getElementById("editPostContent").value.trim();

    if (!title || !content) {
        alert("❌ Please fill in all fields");
        return;
    }

    try {
        await updateDoc(doc(db, "news", currentEditPostId), {
            title: title,
            content: content
        });
        alert("✅ Post updated successfully!");
        closeEditPostModal();
        loadPostsInitial();
    } catch (error) {
        console.error("Error updating post:", error);
        alert(`❌ Error: ${error.message}`);
    }
};

window.deletePost = async function(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        await deleteDoc(doc(db, "news", postId));
        alert("✅ Post deleted!");
        loadPostsInitial();
    } catch (error) {
        console.error("Error deleting post:", error);
        alert(`❌ Error: ${error.message}`);
    }
};

window.closeEditPostModal = function() {
    document.getElementById("editPostModal").classList.remove("show");
    currentEditPostId = null;
};

// ============ EVENTS FUNCTIONS ============

window.createEvent = async function() {
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

    try {
        await addDoc(collection(db, "events"), {
            title: title,
            date: date,
            time: time || "",
            description: description,
            createdAt: serverTimestamp(),
            author: auth.currentUser?.email || "Anonymous"
        });

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
        loadEventsInitial();

    } catch (error) {
        console.error("Error creating event:", error);
        messageDiv.innerHTML = `❌ Error: ${error.message}`;
        messageDiv.className = "message show error";
    } finally {
        btn.disabled = false;
        btn.style.opacity = "1";
    }
};

function loadEventsInitial() {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const container = document.getElementById("events-list");

    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>No events created yet.</p></div>';
            return;
        }

        let html = "";
        snapshot.forEach((docSnap) => {
            const event = docSnap.data();
            const createdDate = event.createdAt ? new Date(event.createdAt.toDate()).toLocaleString() : "Recent";
            const displayTime = event.time ? ` at ${event.time}` : "";

            html += `
                <div class="event-item">
                    <h4 style="margin: 0 0 8px 0;">${escapeHtml(event.title)}</h4>
                    <small style="color: #6b7280;">📅 ${event.date}${displayTime}</small>
                    <p style="margin: 10px 0; color: #374151;">${escapeHtml(event.description)}</p>
                    <small style="color: #9ca3af;">Created ${createdDate}</small>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="editEvent('${docSnap.id}')">✏️ Edit</button>
                        <button class="btn-delete" onclick="deleteEvent('${docSnap.id}')">🗑️ Delete</button>
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

window.editEvent = async function(eventId) {
    try {
        const docSnap = await getDocs(query(collection(db, "events")));
        let eventData = null;

        docSnap.forEach(doc => {
            if (doc.id === eventId) {
                eventData = { id: doc.id, ...doc.data() };
            }
        });

        if (!eventData) {
            alert("Event not found!");
            return;
        }

        currentEditEventId = eventId;
        document.getElementById("editEventTitle").value = eventData.title;
        document.getElementById("editEventDate").value = eventData.date;
        document.getElementById("editEventTime").value = eventData.time || "";
        document.getElementById("editEventDesc").value = eventData.description;
        document.getElementById("editEventModal").classList.add("show");

    } catch (error) {
        console.error("Error editing event:", error);
        alert(`Error: ${error.message}`);
    }
};

window.saveEditEvent = async function() {
    if (!currentEditEventId) return;

    const title = document.getElementById("editEventTitle").value.trim();
    const date = document.getElementById("editEventDate").value;
    const time = document.getElementById("editEventTime").value;
    const description = document.getElementById("editEventDesc").value.trim();

    if (!title || !date || !description) {
        alert("❌ Please fill in all required fields");
        return;
    }

    try {
        await updateDoc(doc(db, "events", currentEditEventId), {
            title: title,
            date: date,
            time: time || "",
            description: description
        });
        alert("✅ Event updated successfully!");
        closeEditEventModal();
        loadEventsInitial();
    } catch (error) {
        console.error("Error updating event:", error);
        alert(`❌ Error: ${error.message}`);
    }
};

window.deleteEvent = async function(eventId) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
        await deleteDoc(doc(db, "events", eventId));
        alert("✅ Event deleted!");
        loadEventsInitial();
    } catch (error) {
        console.error("Error deleting event:", error);
        alert(`❌ Error: ${error.message}`);
    }
};

window.closeEditEventModal = function() {
    document.getElementById("editEventModal").classList.remove("show");
    currentEditEventId = null;
};

// ============ MEMBERS FUNCTIONS ============

window.loadMembers = function() {
    const container = document.getElementById("members-list");
    container.innerHTML = "🔍 Loading members...";
    
    // Try 'members' collection first
    onSnapshot(collection(db, "members"), (snapshot) => {
        if (!snapshot.empty) {
            displayMembers(snapshot, container);
            return;
        }
        
        // Try 'users' collection
        onSnapshot(collection(db, "users"), (snapshot2) => {
            if (!snapshot2.empty) {
                displayMembers(snapshot2, container);
                return;
            }
            
            // Try 'authUsers' collection
            onSnapshot(collection(db, "authUsers"), (snapshot3) => {
                if (!snapshot3.empty) {
                    displayMembers(snapshot3, container);
                } else {
                    container.innerHTML = `
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; color: #92400e;">
                            <p><strong>⚠️ No members found!</strong></p>
                            <p>Create a 'members' collection in Firebase with fields: name, email, position</p>
                        </div>
                    `;
                }
            });
        });
    });
};

window.displayMembers = function(snapshot, container) {
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
    
    snapshot.forEach(docSnap => {
        const member = docSnap.data();
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
};

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

// Export functions to window for global access
export {
    publishPost,
    deletePost,
    editPost,
    closeEditPostModal,
    saveEditPost,
    createEvent,
    deleteEvent,
    editEvent,
    closeEditEventModal,
    saveEditEvent,
    loadMembers
};
