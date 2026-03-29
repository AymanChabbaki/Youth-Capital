import { Router, type IRouter } from "express";
import { db, eventsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/session.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const events = await db.select().from(eventsTable).orderBy(sql`${eventsTable.startAt} asc`);
    const upcoming = req.query.upcoming === "true";
    const now = new Date();
    const filtered = upcoming ? events.filter((e) => e.startAt > now) : events;
    res.json({ events: filtered });
  } catch (err) {
    req.log.error({ err }, "Get events error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, titleAr, description, descriptionAr, startAt, endAt, meetingUrl, type } = req.body;
    const [event] = await db.insert(eventsTable).values({
      title,
      titleAr,
      description,
      descriptionAr,
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : null,
      meetingUrl: meetingUrl || null,
      type,
    }).returning();
    res.status(201).json(event);
  } catch (err) {
    req.log.error({ err }, "Create event error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
