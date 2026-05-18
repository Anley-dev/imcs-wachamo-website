cat << 'EOF' > js/app.js
// IMCS Wachemo - Global UI Interactions
document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("mobile-menu");
    const navMenu = document.querySelector(".nav-menu");

    // 📱 Mobile Hamburger Menu Toggle
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            menuToggle.classList.toggle("is-active");
            navMenu.classList.toggle("active");
        });
    }

    // 🔒 Close mobile menu if a link is clicked
    const navLinks = document.querySelectorAll(".nav-links");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            menuToggle.classList.remove("is-active");
            navMenu.classList.remove("active");
        });
    });

    // ✨ Optional: Sticky Navbar on Scroll
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
        } else {
            navbar.style.boxShadow = "none";
        }
    });
});
EOF

