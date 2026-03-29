import { Router, type IRouter } from "express";
import { db, articlesTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireAdmin, safeUser } from "../lib/session.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const typeFilter = req.query.type as string | undefined;
    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "10"));
    const offset = (page - 1) * limit;
    let query = db.select().from(articlesTable).$dynamic();
    if (typeFilter) {
      query = query.where(eq(articlesTable.type, typeFilter as any));
    }
    const articles = await query.orderBy(sql`${articlesTable.publishedAt} desc`).limit(limit).offset(offset);
    const withAuthors = await Promise.all(
      articles.map(async (a) => {
        const [author] = await db.select().from(usersTable).where(eq(usersTable.id, a.authorId));
        return { ...a, author: safeUser(author) };
      })
    );
    const allArticles = await db.select().from(articlesTable);
    const total = typeFilter ? allArticles.filter((a) => a.type === typeFilter).length : allArticles.length;
    res.json({ articles: withAuthors, total, page, limit });
  } catch (err) {
    req.log.error({ err }, "Get articles error");
    res.status(500).json({ error: "Internal", message: "Server error" });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
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
