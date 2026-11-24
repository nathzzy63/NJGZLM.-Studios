
// ==========================================
// NJGZLM. STUDIOS - CONTACT SYSTEM
// ==========================================

const SUPABASE_FUNCTION_URL =
    "https://vtilcllmgskvnbkcatmn.supabase.co/functions/v1/submit-inquiry";

const SUPABASE_ANON_KEY =
    "sb_publishable_42qxAp4Aifi7AdsB5nAexQ_r8afOTN5";

document.addEventListener("DOMContentLoaded", () => {

    const contactForm = document.getElementById("contactForm");
    const formMessage = document.getElementById("formMessage");
    const submitButton = document.getElementById("submitButton");

    if (!contactForm || !formMessage || !submitButton) {
        console.error("Contact form elements are missing!");
        return;
    }

    function getValue(id, required = true) {

        const element = document.getElementById(id);

        if (!element) {
            if (required) {
                throw new Error(`Missing HTML element: #${id}`);
            }
            return "";
        }

        return element.value.trim();
    }

    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        if (!contactForm.reportValidity()) return;

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        formMessage.textContent = "Sending your inquiry...";
        formMessage.style.color = "#9AFF70";

        try {

            const inquiryData = {
                full_name: getValue("name"),
                email: getValue("email"),
                service: getValue("service"),
                budget: getValue("budget"),
                message: getValue("description"),
                website: getValue("website", false)
            };

            // Check submitted information
            console.log("Inquiry data:", inquiryData);

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

            // Read response safely
            const responseText = await response.text();

            let result;

            try {
                result = JSON.parse(responseText);
            } catch {
                throw new Error(
                    `Invalid server response: ${responseText}`
                );
            }

            console.log("Supabase response:", result);

            if (!response.ok || !result.success) {
                throw new Error(
                    result.error ||
                    `Request failed with status ${response.status}`
                );
            }

            formMessage.textContent =
                result.message ||
                "Your inquiry was submitted successfully!";

            formMessage.style.color = "#9AFF70";

            contactForm.reset();

        } catch (error) {

            console.error("Contact form error:", error);

            formMessage.textContent = error.message;
            formMessage.style.color = "#ff6b6b";

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Submit Inquiry →";

        }

    });

    // Automatic footer year
    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

});
