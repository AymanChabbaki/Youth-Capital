import { Router, type IRouter } from "express";
import { db, roleApplicationsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin, safeUser } from "../lib/session.js";

const router: IRouter = Router();

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

router.post("/applications", requireAuth, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const { preferredRole, region, ministryPreference, parliamentHouse, motivation, languagePreference } = req.body;
    if (!preferredRole || !region || !motivation) {
      res.status(400).json({ error: "BadRequest", message: "Missing required fields" });
      return;
    }
    const [app] = await db.insert(roleApplicationsTable).values({
      userId: currentUser.id,
      preferredRole,
      region,
      ministryPreference: ministryPreference || null,
      parliamentHouse: parliamentHouse || null,
      motivation,
      languagePreference: languagePreference || "en",
    }).returning();
    await db.update(usersTable).set({ applicationStatus: "pending" }).where(eq(usersTable.id, currentUser.id));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, currentUser.id));
    res.status(201).json({ ...app, user: safeUser(user) });
  } catch (err: any) {
    req.log.error({ err }, "Submit application error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.patch("/applications/:id", requireAuth, requireAdmin, async (req, res) => {
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
    res.json({ ...app, user: safeUser(user) });
  } catch (err: any) {
    req.log.error({ err }, "Update application error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
