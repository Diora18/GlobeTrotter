const nodemailer = require('nodemailer');

let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return cachedTransporter;
  }

  // Create auto-provisioned Ethereal test account for real SMTP email delivery
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('[Mailer] Created Ethereal Real Email Test Account:', testAccount.user);

    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return cachedTransporter;
  } catch (err) {
    console.error('[Mailer Error] Failed to create test account:', err);
    return null;
  }
}

async function sendPasswordResetEmail(toEmail, resetToken, userName) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const htmlContent = `
    <!===================================================>
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #0f172a;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <div style="display: inline-block; background-color: #0284c7; color: #ffffff; font-weight: 800; font-size: 18px; padding: 8px 16px; border-radius: 12px; margin-bottom: 8px;">
          ✈️ GlobeTrotter
        </div>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Empowering Personalized Travel Planning</p>
      </div>

      <div style="padding: 24px 0;">
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0;">Reset Your GlobeTrotter Password</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hi ${userName || 'Traveler'},</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">We received a request to reset the password for your GlobeTrotter account (<strong>${toEmail}</strong>).</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Click the button below to set a new password for your account. This link is valid for <strong>1 hour</strong>.</p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #0284c7; color: #ffffff; padding: 14px 32px; font-weight: 700; font-size: 15px; text-decoration: none; border-radius: 10px; display: inline-block; shadow: 0 2px 4px rgba(0,0,0,0.1);">Set New Password</a>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">If you didn't request this email, no action is needed. Your account remains completely secure.</p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">If the button above doesn't work, copy and paste this link into your browser:<br/><a href="${resetUrl}" style="color: #0284c7;">${resetUrl}</a></p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} GlobeTrotter Inc. All rights reserved.
      </div>
    </div>
  `;

  const transporter = await getTransporter();
  let previewUrl = null;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'GlobeTrotter Support'}" <${process.env.SMTP_FROM || 'no-reply@globetrotter.com'}>`,
        to: toEmail,
        subject: '🔐 Reset your GlobeTrotter password',
        html: htmlContent,
      });

      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Mailer] Real email dispatched to ${toEmail}`);
      if (previewUrl) {
        console.log(`[Mailer] Real Webmail Preview Inbox URL: ${previewUrl}`);
      }
    } catch (err) {
      console.error(`[Mailer Error] Failed to send email to ${toEmail}:`, err.message);
    }
  }

  return { resetUrl, previewUrl };
}

module.exports = { sendPasswordResetEmail };
