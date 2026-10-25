import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Civic feedback on the Moroccan Autonomy Initiative for the Sahara.
// NOT anonymous — the submit form explicitly tells respondents their IP
// address and browser info are recorded, and requires explicit consent
// before accepting a submission (enforced server-side too, see
// backend/src/routes/sahara.ts). ipAddress/userAgent are nullable only to
// keep this migration additive; every row created through the consent-gated
// endpoint will have both populated.
export const saharaFeedbackTable = pgTable("sahara_feedback", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(),
  // Which of the document's three sections the opinion addresses — see
  // AXES in backend/src/routes/sahara.ts. Nullable to keep this migration
  // additive on top of rows submitted before this field existed.
  axis: text("axis"),
  // Optional demographics for admin filtering — see AGE_RANGES / GENDERS in
  // backend/src/routes/sahara.ts. Nullable: older rows don't have them.
  ageRange: text("age_range"),
  gender: text("gender"),
  opinion: text("opinion").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSaharaFeedbackSchema = createInsertSchema(saharaFeedbackTable).omit({ id: true, createdAt: true });
export type InsertSaharaFeedback = z.infer<typeof insertSaharaFeedbackSchema>;
export type SaharaFeedback = typeof saharaFeedbackTable.$inferSelect;
