
document.addEventListener("DOMContentLoaded", () => {

    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    if (!menuToggle || !navMenu) {
        console.error("Navigation elements were not found.");
        return;
    }

    // Open and close mobile navigation
    menuToggle.addEventListener("click", () => {

        const isOpen = navMenu.classList.toggle("active");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );

        menuToggle.textContent = isOpen ? "✕" : "☰";

    });

    // Close menu when a navigation link is selected
    navMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation");

            menuToggle.textContent = "☰";

        });

    });

    // Highlight the current page
    const currentPage = window.location.pathname
        .split("/")
        .pop() || "index.html";

    navMenu.querySelectorAll("a").forEach(link => {

        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("active-page");
            link.setAttribute("aria-current", "page");
        }

    });

    // Close mobile navigation when switching to desktop
    window.addEventListener("resize", () => {

        if (window.innerWidth > 700) {

            navMenu.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation");

            menuToggle.textContent = "☰";

        }

    });

});
