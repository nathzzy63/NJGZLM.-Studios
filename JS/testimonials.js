
/* ==========================================
   NJGZLM. STUDIOS
   TESTIMONIALS SYSTEM
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const testimonialGrid = document.getElementById("testimonialGrid");

    // Storage keys
    const APPROVED_KEY = "njgzlm_approved_testimonials";
    const PENDING_KEY = "njgzlm_pending_testimonials";

    // Load testimonials safely
    function getTestimonials(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Unable to load testimonials:", error);
            return [];
        }
    }

    // Save testimonials
    function saveTestimonials(key, testimonials) {
        localStorage.setItem(key, JSON.stringify(testimonials));
    }

    // Display approved testimonials
    function renderTestimonials() {

        if (!testimonialGrid) return;

        const testimonials = getTestimonials(APPROVED_KEY);

        testimonialGrid.innerHTML = "";

        if (testimonials.length === 0) {

            testimonialGrid.innerHTML = `
                <div class="empty-reviews">
                    <i class="fas fa-star"></i>
                    <h3>Your Feedback Matters!</h3>
                    <p>
                        We're excited to feature our first
                        client experiences here soon.
                    </p>
                </div>
            `;

            return;
        }

        testimonials.forEach(review => {

            const card = document.createElement("article");
            card.className = "testimonial-card";

            const stars = document.createElement("div");
            stars.className = "testimonial-stars";
            stars.textContent = "★".repeat(review.rating);

            const message = document.createElement("p");
            message.className = "testimonial-message";
            message.textContent = `"${review.message}"`;

            const clientInfo = document.createElement("div");
            clientInfo.className = "client-info";

            const details = document.createElement("div");

            const name = document.createElement("h4");
            name.textContent = review.name;

            const project = document.createElement("p");
            project.textContent = review.project || "NJGZLM. Studios Client";

            details.append(name, project);
            clientInfo.append(details);

            card.append(stars, message, clientInfo);

            testimonialGrid.appendChild(card);

        });
    }

    // Open feedback form
    const feedbackButton = document.querySelector(
        ".feedback-content .primary-btn"
    );

    if (feedbackButton) {

        feedbackButton.addEventListener("click", event => {

            event.preventDefault();

            const form = document.getElementById("testimonialForm");

            if (form) {
                form.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            } else {
                alert("The feedback form will be available soon!");
            }

        });

    }

    // Interactive star rating
    const ratingStars = document.querySelectorAll(".rating-star");
    const ratingInput = document.getElementById("testimonialRating");

    ratingStars.forEach((star, index) => {

        star.addEventListener("click", () => {

            const rating = index + 1;

            if (ratingInput) {
                ratingInput.value = rating;
            }

            updateStars(rating);

        });

    });

    function updateStars(rating) {

        ratingStars.forEach((star, index) => {

            star.classList.toggle("selected", index < rating);

        });

    }

    // Submit feedback
    const feedbackForm = document.getElementById("testimonialForm");

    if (feedbackForm) {

        feedbackForm.addEventListener("submit", event => {

            event.preventDefault();

            const name = document.getElementById("testimonialName").value.trim();
            const project = document.getElementById("testimonialProject").value.trim();
            const message = document.getElementById("testimonialMessage").value.trim();
            const rating = Number(ratingInput?.value || 0);

            if (!name || !message) {
                alert("Please complete all required fields.");
                return;
            }

            if (name.length > 60 || message.length > 1000 || project.length > 100) {
                alert("Please shorten your response. Some fields exceed the allowed length.");
                return;
            }

            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                alert("Please select a star rating.");
                return;
            }

            const pendingTestimonials = getTestimonials(PENDING_KEY);

            const newTestimonial = {
                id: Date.now(),
                name,
                project,
                message,
                rating,
                status: "pending",
                date: new Date().toISOString()
            };

            pendingTestimonials.push(newTestimonial);

            saveTestimonials(PENDING_KEY, pendingTestimonials);

            feedbackForm.reset();

            if (ratingInput) {
                ratingInput.value = "";
            }

            updateStars(0);

            alert(
                "Thank you for sharing your experience! " +
                "Your testimonial has been submitted for review."
            );

        });

    }

    // Initial rendering
    renderTestimonials();

});

