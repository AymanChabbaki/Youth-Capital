import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireAdmin, safeUser } from "../lib/session.js";
import { clampPageParams } from "../middlewares/validate.js";
import { optionalHttpUrl, optionalLinkedinUrl } from "../validation/common.js";

const router: IRouter = Router();

const SelfUpdateSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  fullNameAr: z.string().trim().max(120).optional(),
  languagePreference: z.enum(["en", "ar"]).optional(),
  bio: z.string().trim().max(1000).optional(),
  region: z.string().trim().max(120).optional(),
  avatarUrl: optionalHttpUrl,
  phone: z.string().trim().max(30).optional(),
  linkedinUrl: optionalLinkedinUrl,
});

const AdminUpdateSchema = SelfUpdateSchema.extend({
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["active", "banned"]).optional(),
  simulationRole: z.string().trim().max(60).optional(),
  applicationStatus: z.enum(["none", "pending", "approved", "rejected"]).optional(),
});

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page, limit, offset } = clampPageParams(req);
    const users = await db.select().from(usersTable).limit(limit).offset(offset);
    const total = await db.select().from(usersTable);
    res.json({ users: users.map(safeUser), total: total.length, page, limit });
  } catch (err: any) {
    req.log.error({ err }, "Get users error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const targetIdString = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parseInt(targetIdString)));
    if (!user) {
      res.status(404).json({ error: "NotFound", message: "User not found" });
      return;
    }
    res.json(safeUser(user));
  } catch (err: any) {
    req.log.error({ err }, "Get user error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const targetIdString = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const targetId = parseInt(targetIdString);
    const currentUser = (req as any).user;
    const isAdmin = currentUser.role === "admin";
    if (!isAdmin && currentUser.id !== targetId) {
      res.status(403).json({ error: "Forbidden", message: "Cannot edit another user's profile" });
      return;
    }
    // Admins get the wider field set (role/status/simulationRole/applicationStatus);
    // everyone else is limited to their own profile fields.
    const schema = isAdmin ? AdminUpdateSchema : SelfUpdateSchema;
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "BadRequest",
        message: "Invalid request body",
        issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
      return;
    }
    const body = result.data as z.infer<typeof AdminUpdateSchema>;

    if (!isAdmin && targetId === currentUser.id && body.role) {
      res.status(403).json({ error: "Forbidden", message: "Cannot change your own role" });
      return;
    }

    const updates: any = {};
    if (body.fullName !== undefined) updates.fullName = body.fullName;
    if (body.fullNameAr !== undefined) updates.fullNameAr = body.fullNameAr;
    if (body.languagePreference !== undefined) updates.languagePreference = body.languagePreference;
    if (body.bio !== undefined) updates.bio = body.bio;
    if (body.region !== undefined) updates.region = body.region;
    if (body.avatarUrl !== undefined) updates.avatarUrl = body.avatarUrl;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.linkedinUrl !== undefined) updates.linkedinUrl = body.linkedinUrl;
    if (isAdmin) {
      if (body.role !== undefined) updates.role = body.role;
      if (body.status !== undefined) updates.status = body.status;
      if (body.simulationRole !== undefined) updates.simulationRole = body.simulationRole || null;
      if (body.applicationStatus !== undefined) updates.applicationStatus = body.applicationStatus;
    }

    if (Object.keys(updates).length === 0) {
      const [current] = await db.select().from(usersTable).where(eq(usersTable.id, targetId));
      if (!current) {
        res.status(404).json({ error: "NotFound", message: "User not found" });
        return;
      }
      res.json(safeUser(current));
      return;
    }

    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, targetId)).returning();
    if (!updated) {
      res.status(404).json({ error: "NotFound", message: "User not found" });
      return;
    }
    res.json(safeUser(updated));
  } catch (err: any) {
    req.log.error({ err }, "Update user error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/:id/ban", requireAuth, requireAdmin, async (req, res) => {
  try {
    const targetIdString = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const [updated] = await db
      .update(usersTable)
      .set({ status: "banned" })
      .where(eq(usersTable.id, parseInt(targetIdString)))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "NotFound", message: "User not found" });
      return;
    }
    res.json(safeUser(updated));
  } catch (err: any) {
    req.log.error({ err }, "Ban user error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/:id/unban", requireAuth, requireAdmin, async (req, res) => {
  try {
    const targetIdString = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const [updated] = await db
      .update(usersTable)
      .set({ status: "active" })
      .where(eq(usersTable.id, parseInt(targetIdString)))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "NotFound", message: "User not found" });
      return;
    }
    res.json(safeUser(updated));
  } catch (err: any) {
    req.log.error({ err }, "Unban user error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const targetIdString = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const targetId = parseInt(targetIdString);
    const currentUser = (req as any).user;
    if (targetId === currentUser.id) {
      res.status(403).json({ error: "Forbidden", message: "Cannot delete your own account" });
      return;
    }
    const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, targetId)).returning();
    if (!deleted) {
      res.status(404).json({ error: "NotFound", message: "User not found" });
      return;
    }
    res.json({ success: true, message: "User deleted" });
  } catch (err: any) {
    // FK violation: user authored polls/articles/crises, which don't cascade-delete
    // (that content should persist independently of the author's account).
    if (err?.code === "23503") {
      res.status(409).json({
        error: "Conflict",
        message: "This user has created content (polls, articles, or crises) and cannot be deleted. Ban the account instead.",
      });
      return;
    }
    req.log.error({ err }, "Delete user error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
