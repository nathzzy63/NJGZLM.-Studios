
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // NJGZLM. STUDIOS
    // SERVICES PAGE JAVASCRIPT
    // ==========================================


    // 1. SELECT PAGE ELEMENTS
    const serviceCards = document.querySelectorAll(".detail-card");

    const serviceButtons = document.querySelectorAll(
        ".detail-card .button"
    );

    const currentYear = document.getElementById("currentYear");

    const projectButton = document.querySelector(
        ".contact-box .button"
    );


    // 2. AUTOMATIC COPYRIGHT YEAR
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    // 3. SCROLL REVEAL ANIMATION
    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.15,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        serviceCards.forEach(card => {
            revealObserver.observe(card);
        });

    } else {

        // Fallback for older browsers
        serviceCards.forEach(card => {
            card.classList.add("visible");
        });

    }


    // 4. SERVICE REQUEST BUTTONS
    serviceButtons.forEach(button => {

        button.addEventListener("click", () => {

            const card = button.closest(".detail-card");

            if (!card) return;

            const serviceTitle = card.querySelector("h2");

            if (!serviceTitle) return;

            const selectedService = serviceTitle.textContent.trim();

            try {

                sessionStorage.setItem(
                    "selectedService",
                    selectedService
                );

            } catch (error) {

                console.warn(
                    "Unable to save selected service:",
                    error
                );

            }

            console.log(
                "Selected service:",
                selectedService
            );

        });

    });


    // 5. GENERAL PROJECT INQUIRY
    if (projectButton) {

        projectButton.addEventListener("click", () => {

            try {

                sessionStorage.setItem(
                    "selectedService",
                    "General Project Inquiry"
                );

            } catch (error) {

                console.warn(
                    "Unable to save project inquiry:",
                    error
                );

            }

        });

    }


    // 6. SMOOTH SCROLLING
    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    // 7. SERVICE CARD ACCESSIBILITY
    serviceCards.forEach(card => {

        const button = card.querySelector(".button");

        if (button) {

            button.addEventListener("focus", () => {
                card.classList.add("focused");
            });

            button.addEventListener("blur", () => {
                card.classList.remove("focused");
            });

        }

    });


    // 8. INITIALIZATION MESSAGE
    console.log(
        "%c NJGZLM. STUDIOS ",
        "background: #78ff4d; color: #080808; padding: 8px; font-weight: bold;"
    );

    console.log(
        "Services page successfully initialized!"
    );

});
