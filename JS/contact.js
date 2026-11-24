
// ==========================================
// NJGZLM. STUDIOS - CONTACT SYSTEM
// ==========================================

const SUPABASE_FUNCTION_URL =
    "https://vtilcllmgskvnbkcatmn.supabase.co/functions/v1/submit-inquiry";

// Use your Supabase publishable or legacy anon key.
const SUPABASE_ANON_KEY = "sb_secret_V6EaBJzCKbcS_LPH_W21bA_iBUzvi7D";

document.addEventListener("DOMContentLoaded", () => {

    const contactForm = document.getElementById("contactForm");
    const formMessage = document.getElementById("formMessage");
    const submitButton = document.getElementById("submitButton");

    // Check required form elements
    if (!contactForm) {
        console.error("Contact form not found!");
        return;
    }

    if (!formMessage || !submitButton) {
        console.error("Form message or submit button is missing!");
        return;
    }

    // Safely retrieve form values
    function getValue(id, required = true) {
        const element = document.getElementById(id);

        if (!element) {
            if (required) {
                throw new Error(
                    `Missing HTML element: #${id}. Check contact.html.`
                );
            }

            return "";
        }

        return element.value.trim();
    }

    // ==========================================
    // FORM SUBMISSION
    // ==========================================

    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        if (!contactForm.reportValidity()) return;

        try {

            const full_name = getValue("name");
            const email = getValue("email");
            const service = getValue("service");
            const budget = getValue("budget");
            const message = getValue("description");
            const website = getValue("website", false);

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
            formMessage.style.color = "#9AFF70";

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

            // Success
            formMessage.textContent =
                result.message || "Your inquiry was submitted successfully!";

            formMessage.style.color = "#9AFF70";

            contactForm.reset();

            console.log("Inquiry submitted:", result.inquiryId);

        } catch (error) {

            console.error("Contact form error:", error);

            formMessage.textContent = error.message;
            formMessage.style.color = "#ff6b6b";

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Submit Inquiry →";

        }

    });

    // ==========================================
    // AUTOMATIC FOOTER YEAR
    // ==========================================

    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

});
