cat << 'EOF' > js/app.js
// IMCS Wachemo - Global UI Interactions
document.addEventListener("DOMContentLoaded", () => {
    // Using querySelector to perfectly match your CSS .menu-toggle class
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    // 📱 Mobile Hamburger Menu Toggle
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", (e) => {
            e.preventDefault();
            menuToggle.classList.toggle("is-active");
            navMenu.classList.toggle("active");
        });
    }

    // 🔒 Close mobile menu if a link is clicked
    const navLinks = document.querySelectorAll(".nav-links, .nav-menu a");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (menuToggle) menuToggle.classList.remove("is-active");
            if (navMenu) navMenu.classList.remove("active");
        });
    });

    // ✨ Sticky Navbar on Scroll
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
            } else {
                navbar.style.boxShadow = "none";
            }
        }
    });
});
EOF

