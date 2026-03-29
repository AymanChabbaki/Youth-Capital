import { Router, type IRouter } from "express";
import { db, eventsTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
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

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, titleAr, description, descriptionAr, startAt, endAt, meetingUrl, type } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (titleAr !== undefined) updates.titleAr = titleAr;
    if (description !== undefined) updates.description = description;
    if (descriptionAr !== undefined) updates.descriptionAr = descriptionAr;
    if (startAt !== undefined) updates.startAt = new Date(startAt);
    if (endAt !== undefined) updates.endAt = endAt ? new Date(endAt) : null;
    if (meetingUrl !== undefined) updates.meetingUrl = meetingUrl;
    if (type !== undefined) updates.type = type;

    const eventId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const [updated] = await db
      .update(eventsTable)
      .set(updates)
      .where(eq(eventsTable.id, eventId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "NotFound", message: "Event not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Update event error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const eventId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const [deleted] = await db
      .delete(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "NotFound", message: "Event not found" });
      return;
    }
    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete event error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
