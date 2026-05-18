
// IMCS Wachemo - Fail-Safe Mobile Menu Engine
document.addEventListener("DOMContentLoaded", () => {
    // Select by either ID or Class to completely bypass structural mismatches
    const menuToggle = document.getElementById("mobile-menu") || document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (menuToggle && navMenu) {
        console.log("Mobile menu DOM bindings successful.");
        
        menuToggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle classes for animations and visibility state
            menuToggle.classList.toggle("is-active");
            navMenu.classList.toggle("active");
            
            console.log("Menu toggled. Active state:", navMenu.classList.contains("active"));
        });
    } else {
        console.error("Layout Error: Navigation DOM elements missing.", { menuToggle, navMenu });
    }

    // Auto-collapse mobile drawer upon clicking individual option links
    const navLinks = document.querySelectorAll(".nav-links, .nav-menu a");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (menuToggle) menuToggle.classList.remove("is-active");
            if (navMenu) navMenu.classList.remove("active");
        });
    });
});
