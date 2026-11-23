const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

// Mobile navigation
menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Close menu after clicking a navigation link
navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});

// Automatic copyright year

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}
