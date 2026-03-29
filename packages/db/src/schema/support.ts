import { pgTable, text, serial, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);
export const ticketCategoryEnum = pgEnum("ticket_category", ["technical", "rules", "account", "other"]);

export const supportTicketsTable = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  category: ticketCategoryEnum("category").notNull().default("other"),
  status: ticketStatusEnum("status").notNull().default("open"),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTicketSchema = createInsertSchema(supportTicketsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type SupportTicket = typeof supportTicketsTable.$inferSelect;
