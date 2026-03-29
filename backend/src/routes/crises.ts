import { Router, type IRouter } from "express";
import { db, crisesTable, usersTable } from "@workspace/db";
import { safeUser } from "../lib/session.js";
import { requireAuth, requireAdmin } from "../lib/session.js";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const crises = await db.select().from(crisesTable);
    const withCreators = await Promise.all(
      crises.map(async (c) => {
        const [creator] = await db.select().from(usersTable).where(eq(usersTable.id, c.createdById));
        return { ...c, createdBy: safeUser(creator) };
      })
    );
    res.json({ crises: withCreators });
  } catch (err) {
    req.log.error({ err }, "Get crises error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const { title, titleAr, description, descriptionAr, severity } = req.body;
    const [crisis] = await db.insert(crisesTable).values({
      title,
      titleAr,
      description,
      descriptionAr,
      severity,
      isActive: true,
      createdById: currentUser.id,
    }).returning();
    res.status(201).json({ ...crisis, createdBy: safeUser(currentUser) });
  } catch (err) {
    req.log.error({ err }, "Trigger crisis error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
