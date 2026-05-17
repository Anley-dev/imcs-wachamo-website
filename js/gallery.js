// Interactive Lightbox Modal Script
document.addEventListener("DOMContentLoaded", () => {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const captionText = document.getElementById("lightbox-caption");
    const closeBtn = document.querySelector(".close-lightbox");

    // Grab all selectable gallery item containers
    const galleryItems = document.querySelectorAll(".gallery-item");

    galleryItems.forEach(item => {
        item.addEventListener("click", () => {
            const img = item.querySelector("img");
            const title = item.querySelector("h3").textContent;
            const subtitle = item.querySelector("p").textContent;

            lightbox.style.display = "block";
            lightboxImg.src = img.src;
            captionText.textContent = `${title} - ${subtitle}`;
        });
    });

    // Close Modal via click handlers
    closeBtn.addEventListener("click", () => {
        lightbox.style.display = "none";
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("close-lightbox")) {
            lightbox.style.display = "none";
        }
    });
});

