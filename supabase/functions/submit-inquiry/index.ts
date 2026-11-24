declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

// @ts-ignore Deno resolves npm: specifiers at runtime.
import { createClient } from "npm:@supabase/supabase-js@2";

// ==========================================
// NSPPLM. STUDIOS - INQUIRY BACKEND
// ==========================================

// Allowed website origins
const allowedOrigins = (
  Deno.env.get("ALLOWED_ORIGINS") ??
  "http://localhost:5500,http://127.0.0.1:5500"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// CORS headers
function getCorsHeaders(origin: string | null) {
  const allowed =
    origin !== null && allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Origin": allowed ? origin : "null",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

// JSON response helper
function sendResponse(
  data: Record<string, unknown>,
  status: number,
  origin: string | null,
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

// Escape HTML to prevent HTML injection in emails
function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

// ==========================================
// MAIN FUNCTION
// ==========================================

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  // Handle browser preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  // Reject unauthorized website origins
  if (origin && !allowedOrigins.includes(origin)) {
    return sendResponse(
      { error: "Origin not allowed." },
      403,
      origin,
    );
  }

  // Accept POST requests only
  if (req.method !== "POST") {
    return sendResponse(
      { error: "Method not allowed." },
      405,
      origin,
    );
  }

  try {
    // Read request body
    const body = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return sendResponse(
        { error: "Invalid request body." },
        400,
        origin,
      );
    }

    // Honeypot spam protection
    if (body.website) {
      return sendResponse({ success: true }, 200, origin);
    }

    // Extract and sanitize input
    const full_name = String(body.full_name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const service = String(body.service ?? "").trim();
    const budget = String(body.budget ?? "").trim();
    const message = String(body.message ?? "").trim();

    // Allowed services
const allowedServices = [
  "Website Development",
  "App Development",
  "Robotics Solutions",
  "Technology Support",
  "Other",
];
    // Validate input
    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (
      full_name.length < 2 ||
      full_name.length > 100 ||
      !validEmail ||
      email.length > 254 ||
      !allowedServices.includes(service) ||
      budget.length > 100 ||
      message.length < 10 ||
      message.length > 3000
    ) {
      return sendResponse(
        {
          error: "Please provide valid inquiry information.",
        },
        400,
        origin,
      );
    }

    // ==========================================
    // ENVIRONMENT VARIABLES
    // ==========================================

    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    const secretKeys = JSON.parse(
      Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}",
    );

    const supabaseSecret =
      secretKeys.default ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const emailFrom = Deno.env.get("EMAIL_FROM");
    const inquiryTo = Deno.env.get("INQUIRY_TO_EMAIL");

    if (!supabaseUrl || !supabaseSecret) {
      console.error("Supabase configuration is missing.");

      return sendResponse(
        { error: "Backend database configuration is incomplete." },
        500,
        origin,
      );
    }

    // ==========================================
    // SUPABASE CLIENT
    // ==========================================

    const supabase = createClient(
      supabaseUrl,
      supabaseSecret,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    // ==========================================
    // SAVE INQUIRY
    // ==========================================

    const { data: inquiry, error: dbError } = await supabase
      .from("inquiries")
      .insert({
        full_name,
        email,
        service,
        budget: budget || null,
        message,
        status: "Pending",
      })
      .select("id, created_at")
      .single();

    if (dbError) {
      console.error("Database insertion failed:", dbError.message);

      return sendResponse(
        {
          error: "Unable to save your inquiry. Please try again later.",
        },
        500,
        origin,
      );
    }

    // ==========================================
    // RESEND EMAIL NOTIFICATION
    // ==========================================

    // Database insertion succeeds even if email
    // notification is not configured or unavailable.

    if (!resendKey || !emailFrom || !inquiryTo) {
      console.warn("Email notification is not configured.");

      return sendResponse(
        {
          success: true,
          notificationSent: false,
          message: "Inquiry saved successfully. Email notification is not configured.",
          inquiryId: inquiry.id,
        },
        200,
        origin,
      );
    }

    const safeName = escapeHTML(full_name);
    const safeEmail = escapeHTML(email);
    const safeService = escapeHTML(service);
    const safeBudget = escapeHTML(budget || "Not specified");
    const safeMessage = escapeHTML(message).replace(/\n/g, "<br>");

    try {
      const emailResult = await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: emailFrom,
            to: [inquiryTo],
            reply_to: email,
            subject: `New Project Inquiry - ${full_name}`,
            html: `
              <div style="font-family: Arial, sans-serif;">
                <h2>New NSPPLM. Studios Inquiry</h2>

                <p><strong>Inquiry ID:</strong> ${inquiry.id}</p>
                <p><strong>Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Service:</strong> ${safeService}</p>
                <p><strong>Budget:</strong> ${safeBudget}</p>

                <h3>Project Description</h3>
                <p>${safeMessage}</p>

                <hr>
                <p>NSPPLM. Studios Inquiry System</p>
              </div>
            `,
          }),
        },
      );

      if (!emailResult.ok) {
        const errorText = await emailResult.text();

        console.error("Resend error:", errorText);

        return sendResponse(
          {
            success: true,
            notificationSent: false,
            message: "Inquiry saved, but email notification could not be sent.",
            inquiryId: inquiry.id,
          },
          200,
          origin,
        );
      }

    } catch (emailError) {
      console.error("Email delivery failed:", emailError);

      return sendResponse(
        {
          success: true,
          notificationSent: false,
          message: "Inquiry saved, but email notification could not be sent.",
          inquiryId: inquiry.id,
        },
        200,
        origin,
      );
    }

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return sendResponse(
      {
        success: true,
        notificationSent: true,
        message: "Your inquiry was successfully submitted!",
        inquiryId: inquiry.id,
      },
      200,
      origin,
    );

  } catch (error) {
    console.error("Inquiry processing error:", error);

    return sendResponse(
      {
        error: "Something went wrong. Please try again later.",
      },
      500,
      origin,
    );
  }
});
