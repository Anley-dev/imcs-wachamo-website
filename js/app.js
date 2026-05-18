// IMCS Wachemo - Fail-Safe Mobile Menu Engine
document.addEventListener("DOMContentLoaded", () => {
    // Selectors broken into multiple lines to prevent terminal truncation bugs
    const menuToggle = document.getElementById("mobile-menu") || 
                       document.querySelector(".menu-toggle") || 
                       document.querySelector(".nav-menu-toggle");
                       
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
        
        // Close menu if user clicks anywhere outside the navigation area
        document.addEventListener("click", (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove("is-active");
                navMenu.classList.remove("active");
            }
        });
        
    } else {
        // Safe multi-line log to avoid nano editor wrapping issues
        console.error("Layout Error: Navigation DOM elements missing.", { 
            menuToggle: !!menuToggle, 
            navMenu: !!navMenu 
        });
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

