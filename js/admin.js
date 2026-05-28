
// IMCS Wachemo - Admin Panel Logic
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

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
                await signOut(auth);
                window.location.href = "index.html";
            }
        });
    }

    // Load existing posts
    loadPosts();
});

// Publish Post Function - Now writes to Firestore
window.publishPost = async function() {
    const title = document.getElementById("post-title").value.trim();
    const content = document.getElementById("post-content").value.trim();

    if (!title || !content) {
        alert("Please fill both Title and Content");
        return;
    }

    try {
        await addDoc(collection(db, "announcements"), {
            title: title,
            content: content,
            createdAt: serverTimestamp()
        });

        alert("✅ Post Published Successfully!");

        // Clear form
        document.getElementById("post-title").value = "";
        document.getElementById("post-content").value = "";

        loadPosts();
    } catch (error) {
        console.error("Error publishing post:", error);
        alert("❌ Error publishing post. Check console for details.");
    }
};

function loadPosts() {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const container = document.getElementById("posts-container");

    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            container.innerHTML = "<p>No posts published yet.</p>";
            return;
        }

        let html = "";
        snapshot.forEach((doc) => {
            const post = doc.data();
            const date = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            }) : "Recent";

            html += `
                <div class="post-item" style="margin-bottom: 15px; padding: 10px; border-left: 4px solid #3b82f6;">
                    <strong>${post.title}</strong>
                    <small style="display:block; color:#64748b; margin:6px 0;">${date}</small>
                    <p>${post.content}</p>
                </div>
            `;
        });

        container.innerHTML = html;
    }, (error) => {
        console.error("Error loading posts:", error);
        container.innerHTML = "<p>Error loading posts. Check console for details.</p>";
    });
}

window.loadPosts = loadPosts;
