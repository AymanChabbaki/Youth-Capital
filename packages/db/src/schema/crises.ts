import { pgTable, text, serial, timestamp, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const crisisSeverityEnum = pgEnum("crisis_severity", ["low", "medium", "high", "critical"]);

export const crisesTable = pgTable("crises", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  description: text("description").notNull(),
  descriptionAr: text("description_ar").notNull(),
  severity: crisisSeverityEnum("severity").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdById: integer("created_by_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCrisisSchema = createInsertSchema(crisesTable).omit({ id: true, createdAt: true });
export type InsertCrisis = z.infer<typeof insertCrisisSchema>;
export type Crisis = typeof crisesTable.$inferSelect;
