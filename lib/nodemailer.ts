import nodemailer from "nodemailer";

// SMTP Transporter configuration
export function getTransporter() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = port === 465;

  if (!user || !pass) {
    console.warn(
      "[Nodemailer] Warning: EMAIL_USER or EMAIL_PASS environment variables are not set. Email delivery might fail."
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

const FROM_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@connect.app";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "admin@connect.app";

/**
 * Sends OTP Email Card for Password Reset
 */
export async function sendOtpEmail(email: string, otp: string, name?: string) {
  const transporter = getTransporter();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP - Connect</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0F1C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0A0F1C; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #111624; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 36px 36px 24px 36px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); background: linear-gradient(180deg, rgba(37, 99, 235, 0.12) 0%, transparent 100%);">
              <div style="display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 16px; background: linear-gradient(135deg, #2563eb 0%, #6366f1 100%); color: #ffffff; font-weight: 800; font-size: 26px; text-align: center; margin-bottom: 12px; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);">
                C
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Connect</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">Security & Authentication</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 36px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #f8fafc;">
                Reset Your Password
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Hello${name ? ` <strong style="color: #f8fafc;">${name}</strong>` : ""},<br>
                We received a request to reset your Connect account password. Use the verification code below to complete the reset process:
              </p>

              <!-- OTP Card Box -->
              <div style="background-color: #1A2235; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #60a5fa; font-weight: 600; margin-bottom: 8px;">One-Time Password (OTP)</span>
                <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff; text-shadow: 0 2px 10px rgba(37, 99, 235, 0.5);">
                  ${otp}
                </span>
                <span style="display: block; font-size: 12px; color: #94a3b8; margin-top: 10px;">
                  ⏱ Valid for <strong>10 minutes</strong>
                </span>
              </div>

              <div style="background-color: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; border-radius: 4px; padding: 12px 16px; margin-top: 24px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #fca5a5;">
                  <strong>Security notice:</strong> If you did not request this password reset, please ignore this email or contact support if you suspect unauthorized access.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px 32px 36px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05); background-color: #0d121f;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                &copy; ${new Date().getFullYear()} Connect Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return transporter.sendMail({
    from: `"Connect Support" <${FROM_EMAIL}>`,
    to: email,
    subject: `${otp} is your Connect password reset OTP`,
    text: `Your password reset OTP is: ${otp}. It expires in 10 minutes.`,
    html,
  });
}

/**
 * Sends Contact Us Notification to Admin and Confirmation to User
 */
export async function sendContactEmails({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const transporter = getTransporter();

  // 1. Admin Email Card
  const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Inquiry - Connect</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0F1C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0A0F1C; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #111624; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="background-color: #2563eb; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 20px; display: inline-block;">
                      New Contact Inquiry
                    </span>
                    <h1 style="margin: 8px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff;">${subject}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding: 28px 32px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #1A2235; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 14px; padding: 16px;">
                <tr>
                  <td style="padding: 6px 12px; font-size: 13px; color: #94a3b8; width: 80px;">From:</td>
                  <td style="padding: 6px 12px; font-size: 14px; font-weight: 600; color: #ffffff;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px; font-size: 13px; color: #94a3b8;">Email:</td>
                  <td style="padding: 6px 12px; font-size: 14px; color: #60a5fa;">
                    <a href="mailto:${email}" style="color: #60a5fa; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px; font-size: 13px; color: #94a3b8;">Received:</td>
                  <td style="padding: 6px 12px; font-size: 13px; color: #cbd5e1;">${new Date().toLocaleString()}</td>
                </tr>
              </table>

              <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600;">Message Content</h3>
              <div style="background-color: #0D1424; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 14px; padding: 20px; font-size: 14px; line-height: 1.7; color: #f1f5f9; white-space: pre-wrap;">
                ${message}
              </div>

              <!-- Quick Reply Action -->
              <div style="margin-top: 24px; text-align: center;">
                <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                  Reply to ${name}
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05); background-color: #0d121f;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">Connect Admin Notification Center</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // 2. User Confirmation Email Card
  const userHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We Received Your Message - Connect</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0F1C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0A0F1C; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #111624; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 24px 36px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); background: linear-gradient(180deg, rgba(37, 99, 235, 0.12) 0%, transparent 100%);">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; background: linear-gradient(135deg, #2563eb 0%, #6366f1 100%); color: #ffffff; font-weight: 800; font-size: 24px; text-align: center; margin-bottom: 12px; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);">
                C
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">Thanks for reaching out!</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">We've received your message</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                Hi <strong style="color: #ffffff;">${name}</strong>,<br>
                Thank you for contacting the Connect team. We have received your inquiry regarding <strong style="color: #60a5fa;">"${subject}"</strong>.
              </p>

              <div style="background-color: #1A2235; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 14px; padding: 18px; margin: 20px 0;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin-bottom: 6px;">Your Message Summary:</span>
                <p style="margin: 0; font-size: 13px; color: #f1f5f9; line-height: 1.6; white-space: pre-wrap;">
                  ${message}
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                Our support team usually reviews inquiries and responds within <strong>24 to 48 hours</strong>. If your request is urgent, feel free to reply directly to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05); background-color: #0d121f;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Connect Real-Time Communications &bull; Support Team
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Send admin notification
  const adminPromise = transporter.sendMail({
    from: `"Connect Contact Form" <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `[Contact Form] ${subject} - from ${name}`,
    text: `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    html: adminHtml,
  });

  // Send user confirmation
  const userPromise = transporter.sendMail({
    from: `"Connect Team" <${FROM_EMAIL}>`,
    to: email,
    subject: `We received your message: ${subject}`,
    text: `Hi ${name},\n\nThank you for reaching out to Connect. We received your message regarding "${subject}" and will respond shortly.`,
    html: userHtml,
  });

  return Promise.all([adminPromise, userPromise]);
}
