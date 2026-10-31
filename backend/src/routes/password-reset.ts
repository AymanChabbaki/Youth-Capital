import crypto from "crypto";
import { Router, type IRouter } from "express";
import { db, usersTable, passwordResetTokensTable } from "@workspace/db";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { validateBody } from "../middlewares/validate.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { hashPassword } from "../lib/password.js";
import { createSession, destroyAllSessions, safeUser, SESSION_COOKIE_OPTIONS } from "../lib/session.js";
import { sendEmailToMany, isMailerConfigured } from "../lib/mailer.js";
import { wrapEmailHtml } from "../lib/email-template.js";
import { frontendUrl } from "../lib/urls.js";
import { logAudit } from "../lib/audit.js";

const router: IRouter = Router();

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const ForgotSchema = z.object({
  email: z.string().trim().email().max(254),
  lang: z.enum(["en", "ar"]).optional(),
});

const ResetSchema = z.object({
  token: z.string().trim().min(32).max(200),
  password: z.string().min(8).max(72),
});

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

// password_reset_tokens was added after launch: create it on first use so a
// deploy works even if `drizzle-kit push` wasn't run. Idempotent and additive.
let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  tableReady ??= db.execute(sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash text NOT NULL UNIQUE,
      expires_at timestamp NOT NULL,
      used_at timestamp,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `).then(() => undefined).catch((err) => {
    tableReady = null;
    throw err;
  });
  return tableReady;
}

const COPY = {
  en: {
    subject: "Reset your Youth Capital password",
    body: (name: string, link: string) => `
      <p style="margin:0 0 1em;">Hi ${name},</p>
      <p style="margin:0 0 1em;">We received a request to reset the password for your Youth Capital account. Click the button below to choose a new one. This link expires in 1 hour and can only be used once.</p>
      <p style="margin:1.5em 0;"><a href="${link}" style="display:inline-block;background:#C9A84C;color:#1B2A4A;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:10px;">Reset my password</a></p>
      <p style="margin:0 0 1em;font-size:13px;color:#6b7280;">Or paste this link into your browser:<br><span style="word-break:break-all;">${link}</span></p>
      <p style="margin:0 0 1em;">If you didn't ask for this, you can ignore this email — your password won't change.</p>`,
  },
  ar: {
    subject: "إعادة تعيين كلمة مرور يوث كابيتال",
    body: (name: string, link: string) => `
      <p style="margin:0 0 1em;">مرحباً ${name}،</p>
      <p style="margin:0 0 1em;">تلقّينا طلباً لإعادة تعيين كلمة مرور حسابك في يوث كابيتال. اضغط على الزر أدناه لاختيار كلمة مرور جديدة. ينتهي هذا الرابط خلال ساعة واحدة ولا يُستخدم إلا مرة واحدة.</p>
      <p style="margin:1.5em 0;"><a href="${link}" style="display:inline-block;background:#C9A84C;color:#1B2A4A;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:10px;">إعادة تعيين كلمة المرور</a></p>
      <p style="margin:0 0 1em;font-size:13px;color:#6b7280;">أو انسخ هذا الرابط في متصفحك:<br><span style="word-break:break-all;">${link}</span></p>
      <p style="margin:0 0 1em;">إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة — لن تتغير كلمة مرورك.</p>`,
  },
};

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Always answers the same way whether or not the email exists, so this
// endpoint can't be used to find out who has an account.
router.post("/forgot-password", authLimiter, validateBody(ForgotSchema), async (req, res) => {
  const generic = { success: true, message: "If an account exists for that email, a reset link is on its way." };
  try {
    if (!isMailerConfigured) {
      res.status(503).json({ error: "NotConfigured", message: "Password reset email is not available right now. Please contact support." });
      return;
    }
    await ensureTable();
    const email = String(req.body.email).toLowerCase();
    const [user] = await db.select().from(usersTable).where(sql`lower(${usersTable.email}) = ${email}`);
    if (!user || user.status === "banned") {
      res.json(generic);
      return;
    }

    // One live link at a time: older unused links stop working.
    await db.delete(passwordResetTokensTable).where(and(eq(passwordResetTokensTable.userId, user.id), isNull(passwordResetTokensTable.usedAt)));
    const token = crypto.randomBytes(32).toString("hex");
    await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    });

    const lang = (req.body.lang || user.languagePreference || "en") as "en" | "ar";
    const link = `${frontendUrl()}/reset-password?token=${token}`;
    const copy = COPY[lang] || COPY.en;
    const [result] = await sendEmailToMany([user.email], copy.subject, wrapEmailHtml(copy.body(escapeHtml(user.fullName.split(" ")[0] || ""), link), lang));
    if (!result?.success) req.log.error({ userId: user.id, error: result?.error }, "Password reset email failed");

    res.json(generic);
  } catch (err) {
    req.log.error({ err }, "Forgot password error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

// Lets the reset page say "this link expired" up front instead of after the
// user has typed a new password twice.
router.get("/reset-password/:token", authLimiter, async (req, res) => {
  try {
    await ensureTable();
    const [row] = await db
      .select({ id: passwordResetTokensTable.id })
      .from(passwordResetTokensTable)
      .where(and(
        eq(passwordResetTokensTable.tokenHash, hashToken(String(req.params.token))),
        isNull(passwordResetTokensTable.usedAt),
        gt(passwordResetTokensTable.expiresAt, new Date()),
      ));
    res.json({ valid: !!row });
  } catch (err) {
    req.log.error({ err }, "Check reset token error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/reset-password", authLimiter, validateBody(ResetSchema), async (req, res) => {
  try {
    await ensureTable();
    const { token, password } = req.body;
    const [row] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(and(
        eq(passwordResetTokensTable.tokenHash, hashToken(token)),
        isNull(passwordResetTokensTable.usedAt),
        gt(passwordResetTokensTable.expiresAt, new Date()),
      ));
    if (!row) {
      res.status(400).json({ error: "InvalidToken", message: "This reset link is invalid or has expired. Please request a new one." });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, row.userId));
    if (!user || user.status === "banned") {
      res.status(400).json({ error: "InvalidToken", message: "This reset link is invalid or has expired. Please request a new one." });
      return;
    }

    await db.update(usersTable).set({ passwordHash: await hashPassword(password) }).where(eq(usersTable.id, user.id));
    await db.update(passwordResetTokensTable).set({ usedAt: new Date() }).where(eq(passwordResetTokensTable.id, row.id));
    // Anyone who was signed in with the old password gets signed out.
    await destroyAllSessions(user.id);
    logAudit(user.id, "auth.password_reset", "user", user.id);

    const session = await createSession(user.id);
    res.cookie("session", session, SESSION_COOKIE_OPTIONS);
    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    req.log.error({ err }, "Reset password error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
