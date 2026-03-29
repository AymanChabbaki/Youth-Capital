import { pgTable, text, serial, timestamp, pgEnum, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users.js";

export const pollStatusEnum = pgEnum("poll_status", ["active", "closed"]);

export const pollsTable = pgTable("polls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  description: text("description"),
  status: pollStatusEnum("status").notNull().default("active"),
  endsAt: timestamp("ends_at"),
  createdById: integer("created_by_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pollOptionsTable = pgTable("poll_options", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull().references(() => pollsTable.id, { onDelete: "cascade" }),
  optionKey: text("option_key").notNull(),
  label: text("label").notNull(),
  labelAr: text("label_ar").notNull(),
  votes: integer("votes").notNull().default(0),
  percentage: real("percentage").notNull().default(0),
});

export const pollVotesTable = pgTable("poll_votes", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull().references(() => pollsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  optionKey: text("option_key").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPollSchema = createInsertSchema(pollsTable).omit({ id: true, createdAt: true });
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type PollRow = typeof pollsTable.$inferSelect;
