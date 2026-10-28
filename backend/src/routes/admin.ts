import { Router, type IRouter } from "express";
import {
  db, usersTable, articlesTable, eventsTable, pollsTable, pollVotesTable,
  crisesTable, postsTable, supportTicketsTable, roleApplicationsTable,
  forumsTable, postLikesTable,
  auditLogsTable, systemLogsTable,
} from "@workspace/db";
import { eq, gte, sql, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, safeUser } from "../lib/session.js";
import { clampPageParams } from "../middlewares/validate.js";

const router: IRouter = Router();

const count = async (table: any, where?: any) => {
  const query = db.select({ count: sql<number>`count(*)::int` }).from(table).$dynamic();
  const [{ count: n }] = where ? await query.where(where) : await query;
  return n;
};

router.get("/kpis", requireAuth, requireAdmin, async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const [
      totalUsers, activeUsers, bannedUsers, newUsers7d, newUsers30d, orphanedRegistrations,
      pendingApplications, approvedApplications, rejectedApplications,
      totalArticles, totalEvents, upcomingEvents,
      totalPolls, activePolls, totalVotes,
      totalCrises, activeCrises,
      totalForumPosts,
      openTickets, totalTickets,
    ] = await Promise.all([
      count(usersTable),
      count(usersTable, eq(usersTable.status, "active")),
      count(usersTable, eq(usersTable.status, "banned")),
      count(usersTable, gte(usersTable.createdAt, sevenDaysAgo)),
      count(usersTable, gte(usersTable.createdAt, thirtyDaysAgo)),
      count(usersTable, eq(usersTable.applicationStatus, "none")),
      count(roleApplicationsTable, eq(roleApplicationsTable.status, "pending")),
      count(roleApplicationsTable, eq(roleApplicationsTable.status, "approved")),
      count(roleApplicationsTable, eq(roleApplicationsTable.status, "rejected")),
      count(articlesTable),
      count(eventsTable),
      count(eventsTable, gte(eventsTable.startAt, now)),
      count(pollsTable),
      count(pollsTable, eq(pollsTable.status, "active")),
      count(pollVotesTable),
      count(crisesTable),
      count(crisesTable, eq(crisesTable.isActive, true)),
      count(postsTable),
      count(supportTicketsTable, eq(supportTicketsTable.status, "open")),
      count(supportTicketsTable),
    ]);

    res.json({
      users: { total: totalUsers, active: activeUsers, banned: bannedUsers, newLast7Days: newUsers7d, newLast30Days: newUsers30d, orphanedRegistrations },
      applications: { pending: pendingApplications, approved: approvedApplications, rejected: rejectedApplications },
      articles: { total: totalArticles },
      events: { total: totalEvents, upcoming: upcomingEvents },
      polls: { total: totalPolls, active: activePolls, totalVotes },
      crises: { total: totalCrises, active: activeCrises },
      community: { totalForumPosts },
      support: { open: openTickets, total: totalTickets },
    });
  } catch (err) {
    req.log.error({ err }, "Get admin KPIs error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

// Raw-but-lightweight activity rows for the admin statistics page. The page
// joins userId/authorId to member demographics client-side so the same
// age/sex/region/date filters apply across every part of the site.
// No message bodies or post content — just what the charts need.
router.get("/site-activity", requireAuth, requireAdmin, async (req, res) => {
  try {
    const CAP = 100000;
    const [forums, posts, likes, pollVotes, tickets, events, articles, crises] = await Promise.all([
      db.select({ id: forumsTable.id, name: forumsTable.name, nameAr: forumsTable.nameAr, category: forumsTable.category }).from(forumsTable),
      db.select({
        id: postsTable.id, forumId: postsTable.forumId, parentId: postsTable.parentId,
        authorId: postsTable.authorId, createdAt: postsTable.createdAt,
      }).from(postsTable).limit(CAP),
      db.select({ postId: postLikesTable.postId, userId: postLikesTable.userId, createdAt: postLikesTable.createdAt }).from(postLikesTable).limit(CAP),
      db.select({
        pollId: pollVotesTable.pollId, userId: pollVotesTable.userId,
        optionKey: pollVotesTable.optionKey, createdAt: pollVotesTable.createdAt,
      }).from(pollVotesTable).limit(CAP),
      db.select({
        id: supportTicketsTable.id, userId: supportTicketsTable.userId, category: supportTicketsTable.category,
        status: supportTicketsTable.status, createdAt: supportTicketsTable.createdAt,
      }).from(supportTicketsTable).limit(CAP),
      db.select({
        id: eventsTable.id, title: eventsTable.title, titleAr: eventsTable.titleAr, type: eventsTable.type,
        startAt: eventsTable.startAt, createdAt: eventsTable.createdAt,
      }).from(eventsTable),
      db.select({
        id: articlesTable.id, title: articlesTable.title, titleAr: articlesTable.titleAr,
        type: articlesTable.type, publishedAt: articlesTable.publishedAt,
      }).from(articlesTable),
      db.select({
        id: crisesTable.id, title: crisesTable.title, severity: crisesTable.severity,
        isActive: crisesTable.isActive, createdAt: crisesTable.createdAt,
      }).from(crisesTable),
    ]);
    res.json({ forums, posts, likes, pollVotes, tickets, events, articles, crises });
  } catch (err) {
    req.log.error({ err }, "Get site activity error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.get("/logs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page, limit, offset } = clampPageParams(req, 50);
    const rows = await db
      .select({ log: auditLogsTable, actor: usersTable })
      .from(auditLogsTable)
      .leftJoin(usersTable, eq(auditLogsTable.actorId, usersTable.id))
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const logs = rows.map(({ log, actor }) => ({ ...log, actor: actor ? safeUser(actor) : null }));
    const total = await count(auditLogsTable);
    res.json({ logs, total, page, limit });
  } catch (err) {
    req.log.error({ err }, "Get admin logs error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.get("/system-logs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page, limit, offset } = clampPageParams(req, 50);
    const levelFilter = req.query.level as string | undefined;

    let query = db.select().from(systemLogsTable).$dynamic();
    if (levelFilter) {
      query = query.where(eq(systemLogsTable.level, levelFilter));
    }
    const logs = await query.orderBy(desc(systemLogsTable.createdAt)).limit(limit).offset(offset);
    const total = await count(systemLogsTable, levelFilter ? eq(systemLogsTable.level, levelFilter) : undefined);
    res.json({ logs, total, page, limit });
  } catch (err) {
    req.log.error({ err }, "Get system logs error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
