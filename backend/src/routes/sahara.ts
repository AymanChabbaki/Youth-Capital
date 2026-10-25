import { Router, type IRouter } from "express";
import { db, saharaFeedbackTable } from "@workspace/db";
import { sql, asc, desc, eq, and, type SQL } from "drizzle-orm";
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

// Matches the three sections on the explainer page (frontend/src/pages/autonomy-initiative.tsx).
export const AXES = [
  "Constitutional & Legal Framework",
  "Distribution of Powers & Institutions",
  "Financial & Natural Resources",
  "General / Other",
] as const;

// Must match AGE_RANGES / GENDERS in frontend/src/components/admin-table.tsx
export const AGE_RANGES = ["Under 18", "18-24", "25-34", "35-44", "45+", "Prefer not to say"] as const;
export const GENDERS = ["Male", "Female", "Prefer not to say"] as const;

const SubmitFeedbackSchema = z.object({
  region: z.enum(REGIONS),
  axis: z.enum(AXES),
  ageRange: z.enum(AGE_RANGES),
  gender: z.enum(GENDERS),
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
    const { region, axis, ageRange, gender, opinion } = req.body;
    await db.insert(saharaFeedbackTable).values({
      region,
      axis,
      ageRange,
      gender,
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

// Admin-only read: aggregate counts by region and by axis, plus the full
// text, IP, and browser info of every submission — exactly what respondents
// were told would be visible to administrators. Supports filtering the list
// by axis, region, age range and/or gender for focused review.
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page, limit, offset } = clampPageParams(req, 50);
    const axisFilter = req.query.axis as string | undefined;
    const regionFilter = req.query.region as string | undefined;
    const ageRangeFilter = req.query.ageRange as string | undefined;
    const genderFilter = req.query.gender as string | undefined;

    const where = (...conds: (SQL | undefined)[]) => {
      const present = conds.filter(Boolean) as SQL[];
      return present.length ? and(...present) : undefined;
    };
    const axisCond = axisFilter ? eq(saharaFeedbackTable.axis, axisFilter) : undefined;
    const regionCond = regionFilter ? eq(saharaFeedbackTable.region, regionFilter) : undefined;
    // Demographic filters narrow every view, including the charts.
    const ageCond = ageRangeFilter ? eq(saharaFeedbackTable.ageRange, ageRangeFilter) : undefined;
    const genderCond = genderFilter ? eq(saharaFeedbackTable.gender, genderFilter) : undefined;
    const whereClause = where(axisCond, regionCond, ageCond, genderCond);

    let entriesQuery = db.select().from(saharaFeedbackTable).$dynamic();
    if (whereClause) entriesQuery = entriesQuery.where(whereClause);
    const entries = await entriesQuery
      .orderBy(asc(saharaFeedbackTable.region), desc(saharaFeedbackTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Each chart drills down by the *other* dimension's filter only — e.g.
    // picking an axis narrows "by region" to that axis, without collapsing
    // it down to a single bar the way applying the region filter would.
    let byRegionQuery = db
      .select({ region: saharaFeedbackTable.region, count: sql<number>`count(*)::int` })
      .from(saharaFeedbackTable)
      .$dynamic();
    const byRegionWhere = where(axisCond, ageCond, genderCond);
    if (byRegionWhere) byRegionQuery = byRegionQuery.where(byRegionWhere);
    const byRegion = await byRegionQuery.groupBy(saharaFeedbackTable.region).orderBy(asc(saharaFeedbackTable.region));

    let byAxisQuery = db
      .select({ axis: saharaFeedbackTable.axis, count: sql<number>`count(*)::int` })
      .from(saharaFeedbackTable)
      .$dynamic();
    const byAxisWhere = where(regionCond, ageCond, genderCond);
    if (byAxisWhere) byAxisQuery = byAxisQuery.where(byAxisWhere);
    const byAxis = await byAxisQuery.groupBy(saharaFeedbackTable.axis).orderBy(asc(saharaFeedbackTable.axis));

    // Region x axis cross-tab — e.g. "how does Laâyoune-Sakia El Hamra feel
    // about financial resources specifically", not just totals of each.
    const crossTab = await db
      .select({
        region: saharaFeedbackTable.region,
        axis: saharaFeedbackTable.axis,
        count: sql<number>`count(*)::int`,
      })
      .from(saharaFeedbackTable)
      .groupBy(saharaFeedbackTable.region, saharaFeedbackTable.axis);

    let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(saharaFeedbackTable).$dynamic();
    if (whereClause) countQuery = countQuery.where(whereClause);
    const [{ count: total }] = await countQuery;
    const [{ count: grandTotal }] = await db.select({ count: sql<number>`count(*)::int` }).from(saharaFeedbackTable);

    res.json({ entries, byRegion, byAxis, crossTab, total, grandTotal, page, limit });
  } catch (err) {
    req.log.error({ err }, "Get sahara feedback error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
