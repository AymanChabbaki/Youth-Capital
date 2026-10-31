import { Router, type IRouter } from "express";
import { db, usersTable, auditLogsTable, emailCampaignsTable } from "@workspace/db";
import { eq, desc, inArray, sql } from "drizzle-orm";
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
  "selected", "custom",
] as const;

const SendEmailSchema = z.object({
  segment: z.enum(SEGMENTS),
  // Used by both "selected" (picked members) and "custom" (pasted addresses).
  customEmails: z.array(z.string().email()).max(1000).optional(),
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
    case "selected": {
      // Specific members picked in the admin UI — only real accounts, with names.
      const emails = [...new Set((customEmails || []).map((e) => e.toLowerCase()))];
      if (!emails.length) return [];
      return db
        .select({ email: usersTable.email, fullName: usersTable.fullName })
        .from(usersTable)
        .where(inArray(sql`lower(${usersTable.email})`, emails));
    }
    case "custom":
      return [...new Set(customEmails || [])].map((email) => ({ email, fullName: "" }));
  }
}

// email_campaigns was added after launch: create it on first use so a deploy
// works even if `drizzle-kit push` wasn't run. Idempotent and additive only.
let historyReady: Promise<void> | null = null;
function ensureHistoryTable(): Promise<void> {
  historyReady ??= db.execute(sql`
    CREATE TABLE IF NOT EXISTS email_campaigns (
      id serial PRIMARY KEY,
      sender_id integer REFERENCES users(id) ON DELETE SET NULL,
      segment text NOT NULL,
      subject text NOT NULL,
      message text NOT NULL,
      lang text NOT NULL DEFAULT 'en',
      recipients jsonb NOT NULL,
      sent_count integer NOT NULL DEFAULT 0,
      failed_count integer NOT NULL DEFAULT 0,
      failures jsonb,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `).then(() => undefined).catch((err) => {
    historyReady = null; // retry on the next request
    throw err;
  });
  return historyReady;
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
    const customEmails = typeof req.query.emails === "string" ? req.query.emails.split(",").filter(Boolean) : undefined;
    const recipients = await resolveRecipients(segment, customEmails);
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
    const failures = results.filter((r) => !r.success);

    // History is best-effort: a failure to record it must not turn a
    // successful send into an error response (the emails already went out).
    try {
      await ensureHistoryTable();
      await db.insert(emailCampaignsTable).values({
        senderId: (req as any).user.id,
        segment,
        subject,
        message,
        lang,
        recipients: recipients.map((r) => r.email),
        sentCount,
        failedCount,
        failures: failures.map((f: any) => ({ email: f.to, error: f.error })),
      });
    } catch (err) {
      req.log.error({ err }, "Failed to record email history");
    }

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
      failures,
    });
  } catch (err) {
    req.log.error({ err }, "Send email error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

// Sent-email history for the admin Emails page. Sends from before the
// email_campaigns table existed only live in the audit log (subject, segment
// and counts, no body), so those are merged in as "legacy" entries.
router.get("/history", requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureHistoryTable();
    const rows = await db
      .select({ campaign: emailCampaignsTable, sender: { id: usersTable.id, fullName: usersTable.fullName, email: usersTable.email } })
      .from(emailCampaignsTable)
      .leftJoin(usersTable, eq(emailCampaignsTable.senderId, usersTable.id))
      .orderBy(desc(emailCampaignsTable.createdAt))
      .limit(500);
    const campaigns = rows.map(({ campaign, sender }) => ({ ...campaign, sender: sender?.id ? sender : null, legacy: false }));

    const firstTracked = campaigns.length ? campaigns[campaigns.length - 1].createdAt : new Date();
    const legacyRows = await db
      .select({ log: auditLogsTable, sender: { id: usersTable.id, fullName: usersTable.fullName, email: usersTable.email } })
      .from(auditLogsTable)
      .leftJoin(usersTable, eq(auditLogsTable.actorId, usersTable.id))
      .where(sql`${auditLogsTable.action} = 'email.sent' AND ${auditLogsTable.createdAt} < ${firstTracked}`)
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(500);
    const legacy = legacyRows.map(({ log, sender }) => {
      const m = (log.metadata || {}) as any;
      return {
        id: `legacy-${log.id}`,
        segment: m.segment || "unknown",
        subject: m.subject || "",
        message: null,
        lang: null,
        recipients: null,
        recipientCount: m.recipientCount ?? null,
        sentCount: m.sentCount ?? 0,
        failedCount: m.failedCount ?? 0,
        failures: null,
        createdAt: log.createdAt,
        sender: sender?.id ? sender : null,
        legacy: true,
      };
    });

    res.json({ campaigns: [...campaigns, ...legacy] });
  } catch (err) {
    req.log.error({ err }, "Get email history error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
