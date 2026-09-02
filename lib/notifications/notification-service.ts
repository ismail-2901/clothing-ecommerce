/**
 * Notification service — provider-agnostic email interface.
 *
 * Wire a real provider (Resend, SendGrid, Nodemailer) by implementing
 * sendEmail() in the provider block. The rest of the system uses the
 * typed helper functions below so business logic never touches transport.
 *
 * Required env vars:
 *   EMAIL_FROM        — sender address, e.g. "Atelier <no-reply@yourdomain.com>"
 *   EMAIL_PROVIDER    — "resend" | "console" (default: console in dev)
 *   RESEND_API_KEY    — required when EMAIL_PROVIDER=resend
 */

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const FROM = process.env.EMAIL_FROM ?? "Atelier <no-reply@ateliercommerce.com>";
const PROVIDER = process.env.EMAIL_PROVIDER ?? "console";

/**
 * Core send function — swap provider implementation here.
 */
async function sendEmail(payload: EmailPayload): Promise<void> {
  if (PROVIDER === "console" || process.env.NODE_ENV === "test") {
    // Development: log to console instead of sending
    console.log("[email]", payload.to, payload.subject);
    return;
  }

  if (PROVIDER === "resend") {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY ?? "");
    await resend.emails.send({
      from: FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    });
    return;
  }

  throw new Error(`Unknown EMAIL_PROVIDER: ${PROVIDER}`);
}

// ─────────────────────────────────────────────
// HTML template helpers (minimal, brand-aligned)
// ─────────────────────────────────────────────

const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Atelier";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ateliercommerce.com";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${BRAND_NAME}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 40px auto; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
    .header { padding: 24px 32px; border-bottom: 1px solid #e5e5e5; }
    .header h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
    .body { padding: 32px; color: #111; font-size: 15px; line-height: 1.6; }
    .body h2 { font-size: 16px; font-weight: 600; margin: 0 0 8px; }
    .body p { margin: 0 0 16px; }
    .btn { display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .footer { padding: 20px 32px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888; }
    .mono { font-family: monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header"><h1>${BRAND_NAME}</h1></div>
    <div class="body">${content}</div>
    <div class="footer">&copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// Typed notification helpers
// ─────────────────────────────────────────────

export async function sendOrderConfirmationEmail(options: {
  to: string;
  orderNumber: string;
  orderId: string;
  grandTotal: number;
  itemCount: number;
  deliveryName: string;
}): Promise<void> {
  const { to, orderNumber, orderId, grandTotal, itemCount, deliveryName } = options;
  const orderUrl = `${APP_URL}/account/orders/${orderId}`;
  const formatted = (grandTotal / 100).toLocaleString("en-BD", { style: "currency", currency: "BDT" });

  await sendEmail({
    to,
    subject: `Order confirmed — ${orderNumber}`,
    html: layout(`
      <h2>Your order is confirmed</h2>
      <p>Hi ${deliveryName}, thank you for your order.</p>
      <p>
        Order number: <span class="mono">${orderNumber}</span><br/>
        ${itemCount} item(s) · Total: <strong>${formatted}</strong>
      </p>
      <p>We'll notify you when your order ships.</p>
      <p><a href="${orderUrl}" class="btn">Track order</a></p>
    `),
    text: `Order confirmed: ${orderNumber}. Total: ${formatted}. Track at ${orderUrl}`
  });
}

export async function sendOrderShippedEmail(options: {
  to: string;
  orderNumber: string;
  orderId: string;
  deliveryName: string;
  trackingNote?: string;
}): Promise<void> {
  const { to, orderNumber, orderId, deliveryName, trackingNote } = options;
  const orderUrl = `${APP_URL}/account/orders/${orderId}`;

  await sendEmail({
    to,
    subject: `Your order is on its way — ${orderNumber}`,
    html: layout(`
      <h2>Your order has shipped</h2>
      <p>Hi ${deliveryName}, great news — <span class="mono">${orderNumber}</span> is on its way.</p>
      ${trackingNote ? `<p>${trackingNote}</p>` : ""}
      <p><a href="${orderUrl}" class="btn">View order</a></p>
    `),
    text: `Your order ${orderNumber} has shipped. View at ${orderUrl}`
  });
}

export async function sendOrderDeliveredEmail(options: {
  to: string;
  orderNumber: string;
  orderId: string;
  deliveryName: string;
}): Promise<void> {
  const { to, orderNumber, orderId, deliveryName } = options;
  const orderUrl = `${APP_URL}/account/orders/${orderId}`;

  await sendEmail({
    to,
    subject: `Delivered — ${orderNumber}`,
    html: layout(`
      <h2>Order delivered</h2>
      <p>Hi ${deliveryName}, your order <span class="mono">${orderNumber}</span> has been delivered. We hope you love it.</p>
      <p>If you have any questions, reply to this email or visit our support page.</p>
      <p><a href="${orderUrl}" class="btn">View order</a></p>
    `),
    text: `Order ${orderNumber} delivered. View at ${orderUrl}`
  });
}

export async function sendPasswordResetEmail(options: {
  to: string;
  resetUrl: string;
}): Promise<void> {
  const { to, resetUrl } = options;

  await sendEmail({
    to,
    subject: `Reset your ${BRAND_NAME} password`,
    html: layout(`
      <h2>Password reset</h2>
      <p>We received a request to reset your password. Click below to continue. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}" class="btn">Reset password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `),
    text: `Reset your password: ${resetUrl}`
  });
}

export async function sendWelcomeEmail(options: {
  to: string;
  name: string;
}): Promise<void> {
  const { to, name } = options;

  await sendEmail({
    to,
    subject: `Welcome to ${BRAND_NAME}`,
    html: layout(`
      <h2>Welcome, ${name || "there"}</h2>
      <p>Your account has been created. Start exploring the collection.</p>
      <p><a href="${APP_URL}/shop" class="btn">Shop now</a></p>
    `),
    text: `Welcome to ${BRAND_NAME}. Shop at ${APP_URL}/shop`
  });
}
