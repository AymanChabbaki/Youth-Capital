import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin, safeUser } from "../lib/session.js";

const router: IRouter = Router();

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "20"));
    const offset = (page - 1) * limit;
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
    if (currentUser.role !== "admin" && currentUser.id !== targetId) {
      res.status(403).json({ error: "Forbidden", message: "Cannot edit another user's profile" });
      return;
    }
    const { fullName, fullNameAr, languagePreference, bio, region } = req.body;
    const updates: any = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (fullNameAr !== undefined) updates.fullNameAr = fullNameAr;
    if (languagePreference !== undefined) updates.languagePreference = languagePreference;
    if (bio !== undefined) updates.bio = bio;
    if (region !== undefined) updates.region = region;
    if (req.body.avatarUrl !== undefined) updates.avatarUrl = req.body.avatarUrl;
    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, targetId)).returning();
    res.json(safeUser(updated));
  } catch (err: any) {
    req.log.error({ err }, "Update user error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const targetIdString = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await db.update(usersTable).set({ status: "banned" }).where(eq(usersTable.id, parseInt(targetIdString)));
    res.json({ success: true, message: "User banned" });
  } catch (err: any) {
    req.log.error({ err }, "Delete user error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
