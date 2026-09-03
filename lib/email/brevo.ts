/**
 * Brevo (formerly Sendinblue) email sender — pure fetch, no SDK.
 *
 * Required env vars:
 *   BREVO_API_KEY   — from https://app.brevo.com/settings/keys/api
 *   EMAIL_FROM      — sender, e.g. "Elaris <no-reply@yourdomain.com>"
 *
 * Dev fallback: if BREVO_API_KEY is not set, the email payload is
 * printed to the terminal instead of being sent.
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export interface BrevoEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendBrevoEmail(payload: BrevoEmailPayload): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Elaris <no-reply@elarisstore.com>";

  if (!apiKey) {
    // Dev mode — log to terminal
    console.log("\n[brevo:dev] Would send email:");
    console.log("  To:     ", payload.to);
    console.log("  Subject:", payload.subject);
    console.log("  Text:   ", payload.text ?? "(html only)");
    console.log("");
    return;
  }

  const [fromName, fromEmail] = parseFromAddress(from);

  const body = {
    sender: { name: fromName, email: fromEmail },
    to: [{ email: payload.to }],
    subject: payload.subject,
    htmlContent: payload.html,
    textContent: payload.text
  };

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Brevo error ${response.status}: ${detail}`);
  }
}

/** Parse "Name <email@example.com>" → ["Name", "email@example.com"] */
function parseFromAddress(from: string): [string, string] {
  const match = from.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return [match[1].trim(), match[2].trim()];
  return ["Elaris", from.trim()];
}
