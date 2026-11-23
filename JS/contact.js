
// ==========================================
// NJGZLM. STUDIOS - CONTACT SYSTEM
// ==========================================

const SUPABASE_FUNCTION_URL =
    "https://vtilcllmgskvnbkcatmn.supabase.co/functions/v1/submit-inquiry";

// Use your Supabase publishable (or legacy anon) key.
// NEVER use your service-role or secret key here.
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");

// ==========================================
// FORM SUBMISSION
// ==========================================

if (contactForm) {

    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        if (!contactForm.reportValidity()) {
            return;
        }

        const full_name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const service =
            document.getElementById("service").value;

        const budget =
            document.getElementById("budget").value;

        const message =
            document.getElementById("description").value.trim();

        const website =
            document.getElementById("website").value;

        const inquiryData = {
            full_name,
            email,
            service,
            budget,
            message,
            website
        };

        // Loading state
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        formMessage.textContent = "Sending your inquiry...";

        try {

            const response = await fetch(
                SUPABASE_FUNCTION_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "apikey": SUPABASE_ANON_KEY,
                        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
                    },

                    body: JSON.stringify(inquiryData)
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.error || "Unable to submit inquiry."
                );
            }

            // Successful submission
            formMessage.textContent = result.message;

            formMessage.style.color = "green";

            contactForm.reset();

            console.log("Inquiry submitted:", result.inquiryId);

        } catch (error) {

            console.error("Contact form error:", error);

            formMessage.textContent =
                error.message || "Something went wrong. Please try again.";

            formMessage.style.color = "red";

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Submit Inquiry →";

        }

    });

}

// ==========================================
// AUTOMATIC FOOTER YEAR
// ==========================================

const yearElement = document.getElementById("currentYear");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}
