/**
 * OTP email template for Elaris.
 * Returns { subject, html, text } ready for sendBrevoEmail().
 */

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Elaris";

export function buildOtpEmail(code: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `${code} is your ${BRAND} verification code`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${BRAND}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
    .wrap { max-width: 480px; margin: 40px auto; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
    .header { padding: 24px 32px; border-bottom: 1px solid #e5e5e5; }
    .header h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
    .body { padding: 32px; color: #111; font-size: 15px; line-height: 1.6; }
    .otp { display: inline-block; font-size: 36px; font-weight: 700; letter-spacing: 0.15em; background: #f5f5f5; padding: 12px 28px; border-radius: 8px; margin: 20px 0; font-family: monospace; }
    .footer { padding: 20px 32px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header"><h1>${BRAND}</h1></div>
    <div class="body">
      <p><strong>Verify your email address</strong></p>
      <p>Enter the code below in the verification screen. It expires in <strong>15 minutes</strong>.</p>
      <div class="otp">${code}</div>
      <p style="font-size:13px;color:#888;">If you didn't create an account, ignore this email.</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} ${BRAND}. All rights reserved.</div>
  </div>
</body>
</html>`,
    text: `Your ${BRAND} verification code is: ${code}\n\nExpires in 15 minutes. If you didn't create an account, ignore this email.`
  };
}
