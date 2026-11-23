
document.addEventListener("DOMContentLoaded", () => {

    console.log("NJGZLM Studios | About page initialized.");

    // =====================================
    // 1. SCROLL REVEAL ANIMATIONS
    // =====================================

    const revealElements = document.querySelectorAll(
        ".reveal, .fade-in, .slide-up"
    );

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                        observer.unobserve(entry.target);
                    }

                });

            },
            {
                threshold: 0.15
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });

    } else {
        revealElements.forEach((element) => {
            element.classList.add("active");
        });
    }


    // =====================================
    // 2. ANIMATED STATISTICS COUNTERS
    // =====================================

    const counters = document.querySelectorAll("[data-count]");

    const animateCounter = (counter) => {

        const target = Number(counter.dataset.count);

        if (!Number.isFinite(target) || target < 0) return;

        const duration = 1800;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {

            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            const easedProgress = 1 - Math.pow(1 - progress, 3);

            const currentValue = Math.floor(
                easedProgress * target
            );

            counter.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }

        };

        requestAnimationFrame(updateCounter);

    };

    if ("IntersectionObserver" in window) {

        const counterObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }

                });

            },
            {
                threshold: 0.5
            }
        );

        counters.forEach((counter) => {
            counterObserver.observe(counter);
        });

    } else {
        counters.forEach(animateCounter);
    }


    // =====================================
    // 3. MOBILE NAVIGATION
    // =====================================

    const menuToggle = document.querySelector(
        ".menu-toggle, .hamburger, #menuToggle"
    );

    const navigation = document.querySelector(
        ".nav-links, .navigation"
    );

    if (menuToggle && navigation) {

        menuToggle.addEventListener("click", () => {

            const isOpen = navigation.classList.toggle("active");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        });

        navigation.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {

                navigation.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

    }


    // =====================================
    // 4. SMOOTH SCROLLING
    // =====================================

    document.querySelectorAll('a[href^="#"]').forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {

                event.preventDefault();

                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    // =====================================
    // 5. DYNAMIC COPYRIGHT YEAR
    // =====================================

    const copyrightYear = document.querySelector(
        "#copyrightYear"
    );

    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }

});
