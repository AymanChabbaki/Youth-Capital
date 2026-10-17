import { Router, type IRouter } from "express";
import { db, saharaFeedbackTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../lib/session.js";
import { validateBody, clampPageParams } from "../middlewares/validate.js";
import { anonFeedbackLimiter } from "../middlewares/rateLimit.js";

const router: IRouter = Router();

const REGIONS = [
  "Tanger-Tétouan-Al Hoceïma", "L'Oriental", "Fès-Meknès", "Rabat-Salé-Kénitra",
  "Béni Mellal-Khénifra", "Casablanca-Settat", "Marrakech-Safi", "Drâa-Tafilalet",
  "Souss-Massa", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab",
  "Moroccan Diaspora", "Prefer not to say",
] as const;

const SubmitFeedbackSchema = z.object({
  region: z.enum(REGIONS),
  opinion: z.string().trim().min(10, "Please share at least a few words").max(4000),
});

// Public, anonymous, rate-limited by IP (not logged — see anonFeedbackLimiter).
// No requireAuth, no user/session/ip ever touches saharaFeedbackTable.
router.post("/", anonFeedbackLimiter, validateBody(SubmitFeedbackSchema), async (req, res) => {
  try {
    const { region, opinion } = req.body;
    await db.insert(saharaFeedbackTable).values({ region, opinion });
    res.status(201).json({ success: true, message: "Thank you — your response has been recorded anonymously." });
  } catch (err) {
    req.log.error({ err }, "Submit sahara feedback error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

// Admin-only read: aggregate counts by region + the full (still-anonymous)
// text of every submission. There is nothing more identifying to show —
// the table simply doesn't have it.
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page, limit, offset } = clampPageParams(req, 50);
    const entries = await db
      .select()
      .from(saharaFeedbackTable)
      .orderBy(desc(saharaFeedbackTable.createdAt))
      .limit(limit)
      .offset(offset);

    const byRegion = await db
      .select({ region: saharaFeedbackTable.region, count: sql<number>`count(*)::int` })
      .from(saharaFeedbackTable)
      .groupBy(saharaFeedbackTable.region);

    const [{ count: total }] = await db.select({ count: sql<number>`count(*)::int` }).from(saharaFeedbackTable);

    res.json({ entries, byRegion, total, page, limit });
  } catch (err) {
    req.log.error({ err }, "Get sahara feedback error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
