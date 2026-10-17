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
  // Required and must be explicitly true — this is not a formality. The
  // page tells respondents their IP and browser info are recorded, and
  // this field is what makes that an actual choice rather than a claim.
  // Enforced here too, not just client-side, so the guarantee holds even
  // if someone calls the API directly.
  consentToDataCollection: z.boolean().refine((v) => v === true, {
    message: "You must consent to data collection to submit a response",
  }),
});

// Public, rate-limited by IP, but NOT anonymous — consent is required and
// the exact data disclosed on the page (IP, user agent) is what gets stored.
router.post("/", anonFeedbackLimiter, validateBody(SubmitFeedbackSchema), async (req, res) => {
  try {
    const { region, opinion } = req.body;
    await db.insert(saharaFeedbackTable).values({
      region,
      opinion,
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });
    res.status(201).json({ success: true, message: "Thank you — your response has been recorded." });
  } catch (err) {
    req.log.error({ err }, "Submit sahara feedback error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

// Admin-only read: aggregate counts by region, plus the full text, IP, and
// browser info of every submission — exactly what respondents were told
// would be visible to administrators.
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
