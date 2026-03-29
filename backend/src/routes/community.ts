import { Router, type IRouter } from "express";
import { db, forumsTable, postsTable, usersTable, postLikesTable } from "@workspace/db";
import { eq, and, isNull, sql } from "drizzle-orm";
import { requireAuth, safeUser } from "../lib/session.js";

const router: IRouter = Router();

async function getPostStats(postId: number, currentUserId?: number) {
  const [{ count: likesCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(postLikesTable)
    .where(eq(postLikesTable.postId, postId));
  
  let isLiked = false;
  if (currentUserId) {
    const [like] = await db
      .select()
      .from(postLikesTable)
      .where(and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, currentUserId)));
    isLiked = !!like;
  }

  const [{ count: replyCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(postsTable)
    .where(eq(postsTable.parentId, postId));

  return { likesCount: likesCount || 0, isLiked, replyCount: replyCount || 0 };
}

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

router.get("/forums/:forumId/posts", async (req, res) => {
  try {
    const forumId = parseInt(req.params.forumId);
    const currentUser = (req as any).user;
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "20"));
    const search = typeof req.query.search === 'string' ? req.query.search : "";
    const sort = typeof req.query.sort === 'string' ? req.query.sort : "newest";
    const offset = (page - 1) * limit;

    const whereClauses = [
      eq(postsTable.forumId, forumId),
      isNull(postsTable.parentId)
    ];

    if (search) {
      whereClauses.push(
        sql`(${postsTable.title} ILIKE ${'%' + search + '%'} OR ${postsTable.content} ILIKE ${'%' + search + '%'})`
      );
    }

    const likesSubquery = db
      .select({ 
        postId: postLikesTable.postId, 
        count: sql<number>`count(*)::int`.as("likes_count") 
      })
      .from(postLikesTable)
      .groupBy(postLikesTable.postId)
      .as("l");

    const baseQuery = db
      .select({
        post: postsTable,
        likesCount: sql<number>`COALESCE(${likesSubquery.count}, 0)::int`,
      })
      .from(postsTable)
      .leftJoin(likesSubquery, eq(postsTable.id, likesSubquery.postId))
      .where(and(...whereClauses));

    if (sort === "popular") {
      baseQuery.orderBy(sql`2 desc`, sql`${postsTable.createdAt} desc`);
    } else {
      baseQuery.orderBy(sql`${postsTable.createdAt} desc`);
    }

    const posts = await baseQuery.limit(limit).offset(offset);

    const withDetails = await Promise.all(
      posts.map(async ({ post, likesCount }) => {
        const [author] = await db.select().from(usersTable).where(eq(usersTable.id, post.authorId));
        const stats = await getPostStats(post.id, currentUser?.id);
        // We use stats.likesCount for consistency with the existing getPostStats logic
        return { ...post, author: safeUser(author), ...stats };
      })
    );

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(postsTable)
      .where(and(...whereClauses));
      
    res.json({ posts: withDetails, total: total || 0, page, limit });
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
    res.status(201).json({ ...post, author: safeUser(currentUser), likesCount: 0, isLiked: false, replyCount: 0 });
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

router.get("/posts/:postId/replies", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const currentUser = (req as any).user;
    const replies = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.parentId, postId))
      .orderBy(sql`${postsTable.createdAt} asc`);
    const withDetails = await Promise.all(
      replies.map(async (r) => {
        const [author] = await db.select().from(usersTable).where(eq(usersTable.id, r.authorId));
        const stats = await getPostStats(r.id, currentUser?.id);
        return { ...r, author: safeUser(author), ...stats };
      })
    );
    res.json({ posts: withDetails, total: withDetails.length });
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
    res.status(201).json({ ...reply, author: safeUser(currentUser), likesCount: 0, isLiked: false, replyCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Create reply error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/posts/:id/like", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const currentUser = (req as any).user;
    const [existing] = await db
      .select()
      .from(postLikesTable)
      .where(and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, currentUser.id)));
    if (existing) {
      res.json({ success: true, message: "Already liked" });
      return;
    }
    await db.insert(postLikesTable).values({ postId, userId: currentUser.id });
    res.json({ success: true, message: "Post liked" });
  } catch (err) {
    req.log.error({ err }, "Like post error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.delete("/posts/:id/like", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const currentUser = (req as any).user;
    await db
      .delete(postLikesTable)
      .where(and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, currentUser.id)));
    res.json({ success: true, message: "Post unliked" });
  } catch (err) {
    req.log.error({ err }, "Unlike post error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
