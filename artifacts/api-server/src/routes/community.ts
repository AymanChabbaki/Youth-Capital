import { Router, type IRouter } from "express";
import { db, forumsTable, postsTable, usersTable } from "@workspace/db";
import { eq, and, isNull, sql } from "drizzle-orm";
import { requireAuth, safeUser } from "../lib/session.js";

const router: IRouter = Router();

router.get("/forums", async (req, res) => {
  try {
    const forums = await db.select().from(forumsTable);
    const forumsWithCounts = await Promise.all(
      forums.map(async (forum) => {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(postsTable)
          .where(eq(postsTable.forumId, forum.id));
        const [lastPost] = await db
          .select({ updatedAt: postsTable.updatedAt })
          .from(postsTable)
          .where(eq(postsTable.forumId, forum.id))
          .orderBy(sql`${postsTable.updatedAt} desc`)
          .limit(1);
        return {
          ...forum,
          postCount: count || 0,
          lastActivityAt: lastPost?.updatedAt || null,
        };
      })
    );
    res.json({ forums: forumsWithCounts });
  } catch (err) {
    req.log.error({ err }, "Get forums error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.get("/forums/:forumId/posts", requireAuth, async (req, res) => {
  try {
    const forumId = parseInt(req.params.forumId);
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "20"));
    const offset = (page - 1) * limit;
    const posts = await db
      .select()
      .from(postsTable)
      .where(and(eq(postsTable.forumId, forumId), isNull(postsTable.parentId)))
      .orderBy(sql`${postsTable.createdAt} desc`)
      .limit(limit)
      .offset(offset);
    const withAuthors = await Promise.all(
      posts.map(async (post) => {
        const [author] = await db.select().from(usersTable).where(eq(usersTable.id, post.authorId));
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(postsTable)
          .where(eq(postsTable.parentId, post.id));
        return { ...post, author: safeUser(author), replyCount: count || 0 };
      })
    );
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(postsTable)
      .where(and(eq(postsTable.forumId, forumId), isNull(postsTable.parentId)));
    res.json({ posts: withAuthors, total: total || 0, page, limit });
  } catch (err) {
    req.log.error({ err }, "Get forum posts error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/forums/:forumId/posts", requireAuth, async (req, res) => {
  try {
    const forumId = parseInt(req.params.forumId);
    const currentUser = (req as any).user;
    const { title, content } = req.body;
    if (!content) {
      res.status(400).json({ error: "BadRequest", message: "Content is required" });
      return;
    }
    const [post] = await db.insert(postsTable).values({
      forumId,
      authorId: currentUser.id,
      title: title || null,
      content,
    }).returning();
    res.status(201).json({ ...post, author: safeUser(currentUser), replyCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Create post error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.delete("/posts/:id", requireAuth, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const [post] = await db.select().from(postsTable).where(eq(postsTable.id, parseInt(req.params.id)));
    if (!post) {
      res.status(404).json({ error: "NotFound", message: "Post not found" });
      return;
    }
    if (currentUser.role !== "admin" && post.authorId !== currentUser.id) {
      res.status(403).json({ error: "Forbidden", message: "Cannot delete this post" });
      return;
    }
    await db.delete(postsTable).where(eq(postsTable.id, post.id));
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete post error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.get("/posts/:postId/replies", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const replies = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.parentId, postId))
      .orderBy(sql`${postsTable.createdAt} asc`);
    const withAuthors = await Promise.all(
      replies.map(async (r) => {
        const [author] = await db.select().from(usersTable).where(eq(usersTable.id, r.authorId));
        return { ...r, author: safeUser(author), replyCount: 0 };
      })
    );
    res.json({ posts: withAuthors, total: withAuthors.length });
  } catch (err) {
    req.log.error({ err }, "Get replies error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/posts/:postId/replies", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const currentUser = (req as any).user;
    const [parentPost] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
    if (!parentPost) {
      res.status(404).json({ error: "NotFound", message: "Post not found" });
      return;
    }
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: "BadRequest", message: "Content required" });
      return;
    }
    const [reply] = await db.insert(postsTable).values({
      forumId: parentPost.forumId,
      parentId: postId,
      authorId: currentUser.id,
      content,
    }).returning();
    res.status(201).json({ ...reply, author: safeUser(currentUser), replyCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Create reply error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
