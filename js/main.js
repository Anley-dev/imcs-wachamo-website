// IMCS Wachemo - Client Mobile Navigation Controls
document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("mobile-menu");
    const navMenu = document.querySelector(".nav-menu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            // Toggle active classes on click
            menuToggle.classList.toggle("is-active");
            navMenu.classList.toggle("active");
        });

        // Close menu automatically when a link is clicked
        document.querySelectorAll(".nav-links").forEach(link => {
            link.addEventListener("click", () => {
                menuToggle.classList.remove("is-active");
                navMenu.classList.remove("active");
            });
        });
    }
});

