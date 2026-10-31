import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users.js";

// One row per email sent from the admin "Emails" page, so admins can see what
// went out, to whom, and whether delivery failed. The backend also creates this
// table on first use (see backend/src/routes/email.ts) so deploys work before
// `drizzle-kit push` is run.
export const emailCampaignsTable = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => usersTable.id, { onDelete: "set null" }),
  segment: text("segment").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  lang: text("lang").notNull().default("en"),
  recipients: jsonb("recipients").notNull().$type<string[]>(),
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  failures: jsonb("failures").$type<{ email: string; error?: string }[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type EmailCampaign = typeof emailCampaignsTable.$inferSelect;
