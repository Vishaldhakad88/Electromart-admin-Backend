// Ensure env vars are loaded when this module is required
require('dotenv').config();
const nodemailer = require('nodemailer');

// Feature flag: enable SMTP delivery in production via SMTP_ENABLED=true
const SMTP_ENABLED = String(process.env.SMTP_ENABLED || 'false').toLowerCase() === 'true';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT, 10) || 587;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === true || false;
const SMTP_USER = process.env.SMTP_USER || null;
const SMTP_PASS = process.env.SMTP_PASS || null;
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER || 'no-reply@example.com';

let transporter = null;
if (SMTP_ENABLED) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });
} else {
  // In development or when disabled, we do not create a transporter
  console.log('SMTP disabled: emails will not be sent (set SMTP_ENABLED=true in production)');
}

// Verify transporter (useful on startup) - only when SMTP_ENABLED
async function verifyTransporter() {
  if (!SMTP_ENABLED) {
    console.log('SMTP disabled, skipping transporter verification');
    return { skipped: true };
  }

  if (!transporter) {
    console.error('SMTP_ENABLED is true but transporter is not configured');
    return { ok: false, error: 'Transporter not configured' };
  }

  try {
    await transporter.verify();
    console.log('SMTP ready');
    return { ok: true };
  } catch (err) {
    console.error('SMTP verification failed:', {
      message: err && err.message ? err.message : err,
      code: err && err.code ? err.code : undefined,
      response: err && err.response ? err.response : undefined,
      stack: err && err.stack ? err.stack.split('\n').slice(0, 3).join(' | ') : undefined
    });
    // Do not throw; verification failure should not crash the server
    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
}

// sendEmail will never throw fatal errors; it logs problems and returns a result object
async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject) {
    console.error('[emailService] sendEmail called with missing params', { to, subject });
    return { success: false, error: 'Missing to or subject' };
  }

  if (!SMTP_ENABLED) {
    // Development behavior: SMS/OTP still printed to console elsewhere; here we just log skip
    console.log(`[emailService] SMTP disabled, skipping email to ${to}`);
    return { success: true, skipped: true, message: 'SMTP disabled' };
  }

  if (!transporter) {
    console.error('[emailService] Transporter not configured though SMTP_ENABLED=true');
    return { success: false, error: 'Transporter not configured' };
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    text: text || undefined,
    html: html || undefined
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, info };
  } catch (err) {
    // Log the error clearly but do not throw
    console.error('[emailService] Failed to send email', {
      to,
      subject,
      message: err && err.message ? err.message : String(err),
      code: err && err.code ? err.code : undefined,
      response: err && err.response ? err.response : undefined,
      stack: err && err.stack ? err.stack.split('\n').slice(0, 3).join(' | ') : undefined
    });
    return { success: false, error: err && err.message ? err.message : String(err) };
  }
}

module.exports = { sendEmail, verifyTransporter, SMTP_ENABLED };
