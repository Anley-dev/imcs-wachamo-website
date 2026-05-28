
// IMCS Wachemo - Admin Panel Logic
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

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
});

// Publish Post Function
window.publishPost = function() {
    const title = document.getElementById("post-title").value.trim();
    const content = document.getElementById("post-content").value.trim();

    if (!title || !content) {
        alert("Please fill both Title and Content");
        return;
    }

    let posts = JSON.parse(localStorage.getItem("imcs_announcements") || "[]");
    posts.unshift({
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    });

    localStorage.setItem("imcs_announcements", JSON.stringify(posts));
    alert("✅ Post Published Successfully!");

    // Clear form
    document.getElementById("post-title").value = "";
    document.getElementById("post-content").value = "";

    loadPosts();
};

function loadPosts() {
    const posts = JSON.parse(localStorage.getItem("imcs_announcements") || "[]");
    const container = document.getElementById("posts-container");

    if (posts.length === 0) {
        container.innerHTML = "<p>No posts published yet.</p>";
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="post-item">
            <strong>${post.title}</strong>
            <small style="display:block; color:#64748b; margin:6px 0;">${post.date}</small>
            <p>${post.content}</p>
        </div>
    `).join('');
}

window.loadPosts = loadPosts;
