import nodemailer from "nodemailer";
import { logger } from "./logger.js";

// SMTP config lives entirely in env vars — never hardcode credentials here.
// For Spaceship-hosted email (Titan-powered), typical values are:
//   SMTP_HOST=smtp.titan.email
//   SMTP_PORT=465
//   SMTP_SECURE=true
// but confirm the exact host/port in your Spaceship email control panel —
// this is written to work with whatever values you set, not just Titan's.
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM_NAME,
  SMTP_FROM_EMAIL,
} = process.env;

export const isMailerConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!isMailerConfigured) {
    throw new Error("SMTP is not configured — set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD in the backend environment.");
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 465,
      secure: SMTP_SECURE !== "false", // default true (port 465/SSL)
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });
  }
  return transporter;
}

export interface SendEmailResult {
  to: string;
  success: boolean;
  error?: string;
}

/**
 * Sends one email per recipient (not a single BCC blast) so a bad address
 * doesn't take down the whole batch, and each failure is individually
 * reported back to the caller.
 */
export async function sendEmailToMany(
  recipients: string[],
  subject: string,
  html: string
): Promise<SendEmailResult[]> {
  const transport = getTransporter();
  const from = SMTP_FROM_NAME ? `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL || SMTP_USER}>` : (SMTP_FROM_EMAIL || SMTP_USER);

  const results: SendEmailResult[] = [];
  for (const to of recipients) {
    try {
      await transport.sendMail({ from, to, subject, html });
      results.push({ to, success: true });
    } catch (err: any) {
      logger.error({ err, to }, "Failed to send email");
      results.push({ to, success: false, error: err?.message || "Unknown error" });
    }
  }
  return results;
}

export async function verifyMailer(): Promise<void> {
  await getTransporter().verify();
}
