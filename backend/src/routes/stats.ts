import { Router, type IRouter } from "express";
import { db, usersTable, postsTable, crisesTable, eventsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const [{ members }] = await db.select({ members: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.status, "active"));
    const [{ posts }] = await db.select({ posts: sql<number>`count(*)::int` }).from(postsTable);
    const [{ activeCrises }] = await db.select({ activeCrises: sql<number>`count(*)::int` }).from(crisesTable).where(eq(crisesTable.isActive, true));
    const now = new Date();
    const allEvents = await db.select().from(eventsTable);
    const upcomingEvents = allEvents.filter((e: any) => e.startAt > now).length;
    res.json({
      activeMinistries: 22,
      billsPassed: 47,
      activeMembers: members || 0,
      totalForumPosts: posts || 0,
      activeCrises: activeCrises || 0,
      upcomingEvents: upcomingEvents || 0,
    });
  } catch (err: any) {
    req.log.error({ err }, "Get stats error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
