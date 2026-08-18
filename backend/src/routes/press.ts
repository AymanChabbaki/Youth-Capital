import { Router, type IRouter } from "express";
import { db, articlesTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireAdmin, safeUser } from "../lib/session.js";
import { validateBody, clampPageParams } from "../middlewares/validate.js";
import { optionalHttpUrl } from "../validation/common.js";

const router: IRouter = Router();

const ARTICLE_TYPES = ["simulation", "platform"] as const;

const CreateArticleSchema = z.object({
  title: z.string().trim().min(1).max(200),
  titleAr: z.string().trim().max(200).optional(),
  content: z.string().trim().min(1).max(20000),
  contentAr: z.string().trim().max(20000).optional(),
  type: z.enum(ARTICLE_TYPES),
  thumbnailUrl: optionalHttpUrl,
});

const UpdateArticleSchema = CreateArticleSchema.partial();

router.get("/", async (req, res) => {
  try {
    const typeFilter = req.query.type as string | undefined;
    const { page, limit, offset } = clampPageParams(req, 10);

    // Single joined query instead of one author lookup per article (N+1),
    // and a SQL count instead of loading the whole table — keeps this endpoint
    // fast enough to survive serverless cold starts on a waking database.
    let query = db
      .select({ article: articlesTable, author: usersTable })
      .from(articlesTable)
      .leftJoin(usersTable, eq(articlesTable.authorId, usersTable.id))
      .$dynamic();
    if (typeFilter) {
      query = query.where(eq(articlesTable.type, typeFilter as any));
    }
    const rows = await query.orderBy(sql`${articlesTable.publishedAt} desc`).limit(limit).offset(offset);
    const withAuthors = rows.map(({ article, author }) => ({
      ...article,
      author: author ? safeUser(author) : null,
    }));

    let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(articlesTable).$dynamic();
    if (typeFilter) {
      countQuery = countQuery.where(eq(articlesTable.type, typeFilter as any));
    }
    const [{ count: total }] = await countQuery;

    res.json({ articles: withAuthors, total, page, limit });
  } catch (err) {
    req.log.error({ err }, "Get articles error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/", requireAuth, requireAdmin, validateBody(CreateArticleSchema), async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const { title, titleAr, content, contentAr, type, thumbnailUrl } = req.body;
    const [article] = await db.insert(articlesTable).values({
      title,
      titleAr,
      content,
      contentAr,
      type,
      authorId: currentUser.id,
      thumbnailUrl: thumbnailUrl || null,
    }).returning();
    res.status(201).json({ ...article, author: safeUser(currentUser) });
  } catch (err) {
    req.log.error({ err }, "Create article error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.patch("/:id", requireAuth, requireAdmin, validateBody(UpdateArticleSchema), async (req, res) => {
  try {
    const { title, titleAr, content, contentAr, type, thumbnailUrl } = req.body;
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (titleAr !== undefined) updates.titleAr = titleAr;
    if (content !== undefined) updates.content = content;
    if (contentAr !== undefined) updates.contentAr = contentAr;
    if (type !== undefined) updates.type = type;
    if (thumbnailUrl !== undefined) updates.thumbnailUrl = thumbnailUrl;

    const articleId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const [updated] = await db
      .update(articlesTable)
      .set(updates)
      .where(eq(articlesTable.id, articleId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "NotFound", message: "Article not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Update article error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const articleId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const [deleted] = await db
      .delete(articlesTable)
      .where(eq(articlesTable.id, articleId))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "NotFound", message: "Article not found" });
      return;
    }
    res.json({ success: true, message: "Article deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete article error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, parseInt(req.params.id)));
    if (!article) {
      res.status(404).json({ error: "NotFound", message: "Article not found" });
      return;
    }
    const [author] = await db.select().from(usersTable).where(eq(usersTable.id, article.authorId));
    res.json({ ...article, author: safeUser(author) });
  } catch (err) {
    req.log.error({ err }, "Get article error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

export default router;
