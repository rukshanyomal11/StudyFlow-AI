import nodemailer from 'nodemailer';

let cachedTransporter = null;

function normalizeBoolean(value) {
  if (typeof value !== 'string') {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export function getEmailConfig() {
  const host = process.env.SMTP_HOST || '';
  const portValue = process.env.SMTP_PORT || '';
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (!host || !portValue || !user || !pass) {
    return null;
  }

  const port = Number(portValue);

  if (!Number.isFinite(port)) {
    throw new Error('SMTP_PORT must be a valid number');
  }

  return {
    host,
    port,
    secure:
      process.env.SMTP_SECURE !== undefined
        ? normalizeBoolean(process.env.SMTP_SECURE)
        : port === 465,
    auth: {
      user,
      pass,
    },
  };
}

export function isEmailConfigured() {
  return Boolean(getEmailConfig());
}

function getFromAddress() {
  return process.env.EMAIL_FROM || process.env.SMTP_USER || '';
}

async function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const config = getEmailConfig();

  if (!config) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport(config);
  return cachedTransporter;
}

export async function sendEmail({ to, subject, html, text }) {
  const transporter = await getTransporter();
  const from = getFromAddress();

  if (!transporter || !from) {
    return {
      sent: false,
      reason: 'Email delivery is not configured',
    };
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  return {
    sent: true,
    messageId: info.messageId,
  };
}
