import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Genuinely anonymous civic feedback on the Moroccan Autonomy Initiative for
// the Sahara. Deliberately has no userId, ip, or any identifying column —
// the public page tells visitors this is anonymous, so the schema has to
// make that true, not just claim it. Spam protection is handled at the
// rate-limiter layer (in-memory, never persisted here), not by logging
// identity alongside the opinion text.
export const saharaFeedbackTable = pgTable("sahara_feedback", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(),
  opinion: text("opinion").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSaharaFeedbackSchema = createInsertSchema(saharaFeedbackTable).omit({ id: true, createdAt: true });
export type InsertSaharaFeedback = z.infer<typeof insertSaharaFeedbackSchema>;
export type SaharaFeedback = typeof saharaFeedbackTable.$inferSelect;
