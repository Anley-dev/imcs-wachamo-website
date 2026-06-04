
console.log("✅ Admin Panel JS Loaded");

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCxD9h4BBPNbbuepLTEyQIesMj44eEqdNA",
    authDomain: "imcs-wachamo.firebaseapp.com",
    projectId: "imcs-wachamo",
    storageBucket: "imcs-wachamo.firebasestorage.app",
    messagingSenderId: "445125483030",
    appId: "1:445125483030:web:2eaa94ecac7a13ef0fb337"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Logout?")) {
                auth.signOut().then(() => window.location.href = "index.html");
            }
        });
    });

    loadPosts();
});

// Publish Post
window.publishPost = function() {
    const title = document.getElementById("post-title").value.trim();
    const content = document.getElementById("post-content").value.trim();
    const message = document.getElementById("post-message");

    if (!title || !content) {
        message.innerHTML = "❌ Fill title and content";
        message.style.color = "red";
        return;
    }

    db.collection("announcements").add({
        title: title,
        content: content,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        message.innerHTML = "✅ Published successfully!";
        message.style.color = "green";
        document.getElementById("post-title").value = "";
        document.getElementById("post-content").value = "";
        loadPosts();
    }).catch(err => {
        message.innerHTML = "❌ Error: " + err.message;
        message.style.color = "red";
    });
};

// Load Posts
function loadPosts() {
    const container = document.getElementById("posts-container");
    container.innerHTML = "Loading...";

    db.collection("announcements").orderBy("createdAt", "desc").onSnapshot(snapshot => {
        let html = "";
        snapshot.forEach(doc => {
            const p = doc.data();
            html += `<div style="background:#f8fafc;padding:15px;margin:10px 0;border-radius:8px;">
                        <strong>${p.title}</strong><br>
                        <small>${p.createdAt ? new Date(p.createdAt.toDate()).toLocaleString() : ''}</small>
                        <p>${p.content}</p>
                     </div>`;
        });
        container.innerHTML = html || "<p>No posts yet.</p>";
    });
}

window.createEvent = function() {
    alert("Event creation ready. Will be fully functional soon.");
};

window.loadMembers = function() {
    document.getElementById("members-list").innerHTML = "<p>Anley Belay (Admin)</p>";
};
