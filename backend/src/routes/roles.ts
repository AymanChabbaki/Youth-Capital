import { Router, type IRouter } from "express";
import { db, roleApplicationsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireAdmin, safeUser } from "../lib/session.js";
import { validateBody } from "../middlewares/validate.js";
import { logAudit } from "../lib/audit.js";
import { sendEmailToMany, isMailerConfigured } from "../lib/mailer.js";

const router: IRouter = Router();

const PREFERRED_ROLES = ["minister", "mp", "local_council", "diaspora_rep", "Active Member", "Executive Bureau Member", "Ambassador Member"] as const;
const PARLIAMENT_HOUSES = ["house_of_representatives", "house_of_councillors"] as const;
const APPLICATION_STATUSES = ["pending", "approved", "rejected"] as const;

// Exported so /api/auth/register-and-apply (auth.ts) can validate registration
// and application fields together, for the one-shot atomic signup endpoint.
export const CreateApplicationSchema = z.object({
  preferredRole: z.enum(PREFERRED_ROLES),
  region: z.string().trim().min(1).max(120),
  ministryPreference: z.string().trim().max(120).optional(),
  parliamentHouse: z.enum(PARLIAMENT_HOUSES).optional(),
  motivation: z.string().trim().min(1).max(4000),
  languagePreference: z.enum(["en", "ar"]).optional(),
  gender: z.string().trim().max(40).optional(),
  age: z.coerce.number().int().min(12).max(120).optional(),
  country: z.string().trim().max(80).optional(),
  occupationStatus: z.string().trim().max(60).optional(),
  fieldOfStudy: z.string().trim().max(120).optional(),
  educationLevel: z.string().trim().max(60).optional(),
  interests: z.array(z.string().trim().max(60)).max(10).optional(),
});

const UpdateApplicationSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  assignedRole: z.enum(PREFERRED_ROLES).optional(),
  adminNote: z.string().trim().max(2000).optional(),
});

router.get("/applications", requireAuth, requireAdmin, async (req, res) => {
  try {
    const statusFilter = req.query.status as string | undefined;
    const apps = await db.select().from(roleApplicationsTable);
    const filtered = statusFilter ? apps.filter((a) => a.status === statusFilter) : apps;
    const withUsers = await Promise.all(
      filtered.map(async (app) => {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, app.userId));
        return { ...app, user: user ? safeUser(user) : null };
      })
    );
    res.json({ applications: withUsers, total: withUsers.length });
  } catch (err: any) {
    req.log.error({ err }, "Get applications error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/applications", requireAuth, validateBody(CreateApplicationSchema), async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const {
      preferredRole, region, ministryPreference, parliamentHouse, motivation, languagePreference,
      gender, age, country, occupationStatus, fieldOfStudy, educationLevel, interests,
    } = req.body;
    const [app] = await db.insert(roleApplicationsTable).values({
      userId: currentUser.id,
      preferredRole,
      region,
      ministryPreference: ministryPreference || null,
      parliamentHouse: parliamentHouse || null,
      motivation,
      languagePreference: languagePreference || "en",
      gender: gender || null,
      age: age ?? null,
      country: country || null,
      occupationStatus: occupationStatus || null,
      fieldOfStudy: fieldOfStudy || null,
      educationLevel: educationLevel || null,
      interests: interests?.length ? interests.join(", ") : null,
    }).returning();
    await db.update(usersTable).set({ applicationStatus: "pending" }).where(eq(usersTable.id, currentUser.id));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, currentUser.id));
    res.status(201).json({ ...app, user: safeUser(user) });
  } catch (err: any) {
    req.log.error({ err }, "Submit application error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.patch("/applications/:id", requireAuth, requireAdmin, validateBody(UpdateApplicationSchema), async (req, res) => {
  try {
    const { status, assignedRole, adminNote } = req.body;
    const updates: any = { status };
    if (assignedRole !== undefined) updates.assignedRole = assignedRole;
    if (adminNote !== undefined) updates.adminNote = adminNote;
    const targetIdString = String(req.params.id);
    const [app] = await db
      .update(roleApplicationsTable)
      .set(updates)
      .where(eq(roleApplicationsTable.id, parseInt(targetIdString)))
      .returning();
    if (status === "approved") {
      await db
        .update(usersTable)
        .set({ applicationStatus: "approved", simulationRole: assignedRole || app.preferredRole })
        .where(eq(usersTable.id, app.userId));
    } else if (status === "rejected") {
      await db
        .update(usersTable)
        .set({ applicationStatus: "rejected" })
        .where(eq(usersTable.id, app.userId));
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, app.userId));
    logAudit((req as any).user.id, `application.${status}`, "roleApplication", app.id, { applicantEmail: user?.email, assignedRole: updates.assignedRole });

    // Automated notification — the applicant hears back the moment an admin
    // decides, with zero extra clicks. Never lets an email failure affect
    // the approve/reject action itself.
    if (user && isMailerConfigured && (status === "approved" || status === "rejected")) {
      const isAr = user.languagePreference === "ar";
      const role = updates.assignedRole || app.preferredRole;
      const subject = status === "approved"
        ? (isAr ? "تم قبول طلبك في يوث كابيتال" : "Your Youth Capital application has been approved")
        : (isAr ? "بخصوص طلبك في يوث كابيتال" : "An update on your Youth Capital application");
      const html = status === "approved"
        ? (isAr
            ? `<p>مرحباً ${user.fullName}،</p><p>يسعدنا إبلاغك بأنه تم قبول طلبك! تم تعيينك في دور <strong>${role}</strong>.</p><p>سجّل الدخول إلى لوحتك لمتابعة المحاكاة.</p>`
            : `<p>Hi ${user.fullName},</p><p>Great news — your application has been approved! You've been assigned the role of <strong>${role}</strong>.</p><p>Log in to your dashboard to get started.</p>`)
        : (isAr
            ? `<p>مرحباً ${user.fullName}،</p><p>شكراً لاهتمامك بيوث كابيتال. بعد المراجعة، لم نتمكن من قبول طلبك في الوقت الحالي. نرحب بإعادة التقديم مستقبلاً.</p>`
            : `<p>Hi ${user.fullName},</p><p>Thank you for your interest in Youth Capital. After review, we're unable to move forward with your application at this time. You're welcome to apply again in the future.</p>`);
      try {
        await sendEmailToMany([user.email], subject, html);
      } catch (err) {
        req.log.error({ err, userId: user.id }, "Failed to send application decision email");
      }
    }

    res.json({ ...app, user: safeUser(user) });
  } catch (err: any) {
    req.log.error({ err }, "Update application error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
