cat << 'EOF' > js/app.js
// Global Application & Mobile Navigation Controller
document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuBtn = document.getElementById("mobile-menu");
    const navMenuLinks = document.querySelector(".nav-menu");

    if (mobileMenuBtn && navMenuLinks) {
        mobileMenuBtn.addEventListener("click", () => {
            // Toggle active classes to animate the hamburger icon and drop down the menu
            mobileMenuBtn.classList.toggle("active");
            navMenuLinks.classList.toggle("active");
        });

        // Close menu cleanly when a user clicks any navigation link
        document.querySelectorAll(".nav-links").forEach(link => {
            link.addEventListener("click", () => {
                mobileMenuBtn.classList.remove("active");
                navMenuLinks.classList.remove("active");
            });
        });
    }
});
EOF

