import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users.js";

// Records significant admin actions (ban/unban/delete a user, approve/reject
// an application, trigger a crisis, create/update/delete content) so the
// admin panel can show a real activity log instead of nothing. actorId is
// nullable for the rare system-initiated entry with no admin behind it.
export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id").references(() => usersTable.id),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: integer("target_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;
