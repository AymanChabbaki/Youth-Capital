import { pgTable, text, serial, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const forumCategoryEnum = pgEnum("forum_category", ["parliament", "ministry", "regional", "general"]);

export const forumsTable = pgTable("forums", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description").notNull().default(""),
  descriptionAr: text("description_ar").notNull().default(""),
  category: forumCategoryEnum("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forumsTable.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"),
  authorId: integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const postLikesTable = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => postsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertForumSchema = createInsertSchema(forumsTable).omit({ id: true, createdAt: true });
export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPostLikeSchema = createInsertSchema(postLikesTable).omit({ id: true, createdAt: true });
export type InsertForum = z.infer<typeof insertForumSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type Forum = typeof forumsTable.$inferSelect;
export type Post = typeof postsTable.$inferSelect;
export type PostLike = typeof postLikesTable.$inferSelect;
