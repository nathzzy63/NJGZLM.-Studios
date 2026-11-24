
import { createClient } from "npm:@supabase/supabase-js@2";

// ==========================================
// NJGZLM STUDIOS - INQUIRY BACKEND
// ==========================================

// Allowed website origins
const allowedOrigins = (
  Deno.env.get("ALLOWED_ORIGINS") ??
  "http://localhost:5500,http://127.0.0.1:5500,https://njgzlmstudios-git-main-crshs.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Allowed services
const allowedServices = [
  "Website Development",
  "App Development",
  "Robotics Solutions",
  "Technology Support",
  "Other",
];

// ==========================================
// CORS
// ==========================================

function getCorsHeaders(origin: string | null) {
  const normalizedOrigin = origin?.replace(/\/$/, "") ?? "";

  const allowed =
    origin !== null &&
    allowedOrigins.includes(normalizedOrigin);

  return {
    "Access-Control-Allow-Origin": allowed
      ? normalizedOrigin
      : "null",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

// ==========================================
// JSON RESPONSE
// ==========================================

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

// ==========================================
// SECURITY HELPERS
// ==========================================

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

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// ==========================================
// MAIN FUNCTION
// ==========================================

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    if (origin && !allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return sendResponse(
        { success: false, error: "Origin not allowed." },
        403,
        origin,
      );
    }

    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  // Only POST requests allowed
  if (req.method !== "POST") {
    return sendResponse(
      { success: false, error: "Method not allowed." },
      405,
      origin,
    );
  }

  // Verify website origin
  if (origin && !allowedOrigins.includes(origin.replace(/\/$/, ""))) {
    return sendResponse(
      { success: false, error: "Origin not allowed." },
      403,
      origin,
    );
  }

  try {
    // ==========================================
    // READ REQUEST BODY
    // ==========================================

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return sendResponse(
        { success: false, error: "Invalid JSON request." },
        400,
        origin,
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return sendResponse(
        { success: false, error: "Invalid request body." },
        400,
        origin,
      );
    }

    const data = body as Record<string, unknown>;

    // ==========================================
    // HONEYPOT SPAM PROTECTION
    // ==========================================

    if (data.website) {
      return sendResponse(
        {
          success: true,
          message: "Your inquiry was submitted successfully.",
        },
        200,
        origin,
      );
    }

    // ==========================================
    // EXTRACT FORM DATA
    // ==========================================

    const full_name = cleanString(data.full_name);
    const email = cleanString(data.email).toLowerCase();
    const service = cleanString(data.service);
    const budget = cleanString(data.budget);
    const message = cleanString(data.message);

    // ==========================================
    // VALIDATE INPUT
    // ==========================================

    const errors: string[] = [];

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (full_name.length < 2 || full_name.length > 100) {
      errors.push("Name must contain 2-100 characters.");
    }

    if (!validEmail || email.length > 254) {
      errors.push("Please enter a valid email address.");
    }

    if (!allowedServices.includes(service)) {
      errors.push("Please select a valid service.");
    }

    if (budget.length > 100) {
      errors.push("Budget must not exceed 100 characters.");
    }

    if (message.length < 10 || message.length > 3000) {
      errors.push("Description must contain 10-3000 characters.");
    }

    if (errors.length > 0) {
      console.error("Inquiry validation failed:", errors);

      return sendResponse(
        {
          success: false,
          error: errors.join(" "),
          validationErrors: errors,
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
      console.error("Supabase backend configuration is missing.");

      return sendResponse(
        {
          success: false,
          error: "Backend database configuration is incomplete.",
        },
        500,
        origin,
      );
    }

    // ==========================================
    // INITIALIZE SUPABASE
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
    // SAVE INQUIRY TO DATABASE
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
          success: false,
          error: "Unable to save your inquiry. Please try again later.",
        },
        500,
        origin,
      );
    }

    // ==========================================
    // RESEND EMAIL NOTIFICATION
    // ==========================================

    if (!resendKey || !emailFrom || !inquiryTo) {
      console.warn("Email notification configuration is incomplete.");

      return sendResponse(
        {
          success: true,
          notificationSent: false,
          message: "Your inquiry was saved successfully!",
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
              <div style="font-family:Arial,sans-serif;color:#222;line-height:1.6;">
                <h2>New NJGZLM Studios Inquiry</h2>

                <p><strong>Inquiry ID:</strong> ${inquiry.id}</p>
                <p><strong>Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Service:</strong> ${safeService}</p>
                <p><strong>Budget:</strong> ${safeBudget}</p>

                <h3>Project Description</h3>
                <p>${safeMessage}</p>

                <hr>
                <p>NJGZLM Studios Inquiry System</p>
              </div>
            `,
          }),
        },
      );

      if (!emailResult.ok) {
        const errorText = await emailResult.text();

        console.error("Resend notification failed:", errorText);

        return sendResponse(
          {
            success: true,
            notificationSent: false,
            message: "Your inquiry was saved, but email notification could not be sent.",
            inquiryId: inquiry.id,
          },
          200,
          origin,
        );
      }

    } catch (emailError) {
      console.error("Email delivery error:", emailError);

      return sendResponse(
        {
          success: true,
          notificationSent: false,
          message: "Your inquiry was saved, but email notification could not be sent.",
          inquiryId: inquiry.id,
        },
        200,
        origin,
      );
    }

    // ==========================================
    // SUCCESS
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
        success: false,
        error: "Something went wrong. Please try again later.",
      },
      500,
      origin,
    );
  }
});
