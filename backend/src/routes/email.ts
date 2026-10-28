import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../lib/session.js";
import { validateBody } from "../middlewares/validate.js";
import { emailLimiter } from "../middlewares/rateLimit.js";
import { sendEmailToMany, isMailerConfigured } from "../lib/mailer.js";
import { wrapEmailHtml } from "../lib/email-template.js";
import { logAudit } from "../lib/audit.js";

const router: IRouter = Router();

const SEGMENTS = [
  "all_users", "active_users", "banned_users",
  "pending_applicants", "approved_applicants", "rejected_applicants",
  "custom",
] as const;

const SendEmailSchema = z.object({
  segment: z.enum(SEGMENTS),
  customEmails: z.array(z.string().email()).max(500).optional(),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(20000),
  lang: z.enum(["en", "ar"]).optional().default("en"),
});

async function resolveRecipients(segment: (typeof SEGMENTS)[number], customEmails?: string[]): Promise<{ email: string; fullName: string }[]> {
  switch (segment) {
    case "all_users":
      return db.select({ email: usersTable.email, fullName: usersTable.fullName }).from(usersTable);
    case "active_users":
      return db.select({ email: usersTable.email, fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.status, "active"));
    case "banned_users":
      return db.select({ email: usersTable.email, fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.status, "banned"));
    case "pending_applicants":
      return db.select({ email: usersTable.email, fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.applicationStatus, "pending"));
    case "approved_applicants":
      return db.select({ email: usersTable.email, fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.applicationStatus, "approved"));
    case "rejected_applicants":
      return db.select({ email: usersTable.email, fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.applicationStatus, "rejected"));
    case "custom":
      return (customEmails || []).map((email) => ({ email, fullName: "" }));
  }
}

// Preview only — no sending, no audit log. Lets the admin UI show an
// accurate recipient count before the irreversible send action.
router.get("/recipients", requireAuth, requireAdmin, async (req, res) => {
  try {
    const segment = req.query.segment as (typeof SEGMENTS)[number];
    if (!SEGMENTS.includes(segment)) {
      res.status(400).json({ error: "BadRequest", message: "Invalid segment" });
      return;
    }
    const recipients = await resolveRecipients(segment);
    res.json({ count: recipients.length, sample: recipients.slice(0, 5).map((r) => r.email) });
  } catch (err) {
    req.log.error({ err }, "Preview recipients error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.get("/status", requireAuth, requireAdmin, (req, res) => {
  res.json({ configured: isMailerConfigured });
});

router.post("/send", requireAuth, requireAdmin, emailLimiter, validateBody(SendEmailSchema), async (req, res) => {
  try {
    if (!isMailerConfigured) {
      res.status(503).json({ error: "NotConfigured", message: "SMTP is not configured on the server yet" });
      return;
    }
    const { segment, customEmails, subject, message, lang } = req.body;
    const recipients = await resolveRecipients(segment, customEmails);

    if (recipients.length === 0) {
      res.status(400).json({ error: "BadRequest", message: "No recipients match this selection" });
      return;
    }
    if (recipients.length > 1000) {
      res.status(400).json({ error: "BadRequest", message: "Too many recipients for a single send (max 1000) — narrow the segment" });
      return;
    }

    // Simple paragraph-per-line HTML so plain text typed in the admin UI
    // renders with actual line breaks instead of collapsing.
    const bodyHtml = message
      .split(/\n{2,}/)
      .map((para: string) => `<p style="margin:0 0 1em;white-space:pre-wrap;">${para.replace(/</g, "&lt;")}</p>`)
      .join("");
    const html = wrapEmailHtml(bodyHtml, lang);

    const results = await sendEmailToMany(recipients.map((r) => r.email), subject, html);
    const sentCount = results.filter((r) => r.success).length;
    const failedCount = results.length - sentCount;

    logAudit((req as any).user.id, "email.sent", "email", undefined, {
      segment,
      subject,
      recipientCount: recipients.length,
      sentCount,
      failedCount,
    });

    res.json({
      sent: sentCount,
      failed: failedCount,
      failures: results.filter((r) => !r.success),
    });
  } catch (err) {
    req.log.error({ err }, "Send email error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
