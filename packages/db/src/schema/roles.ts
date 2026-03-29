import { pgTable, text, serial, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const roleApplicationStatusEnum = pgEnum("role_application_status", ["pending", "approved", "rejected"]);
export const preferredRoleEnum = pgEnum("preferred_role", ["minister", "mp", "local_council", "diaspora_rep"]);
export const parliamentHouseEnum = pgEnum("parliament_house", ["house_of_representatives", "house_of_councillors"]);

export const roleApplicationsTable = pgTable("role_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  preferredRole: preferredRoleEnum("preferred_role").notNull(),
  region: text("region").notNull(),
  ministryPreference: text("ministry_preference"),
  parliamentHouse: parliamentHouseEnum("parliament_house"),
  motivation: text("motivation").notNull(),
  languagePreference: text("language_preference").notNull().default("en"),
  status: roleApplicationStatusEnum("status").notNull().default("pending"),
  assignedRole: text("assigned_role"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRoleApplicationSchema = createInsertSchema(roleApplicationsTable).omit({ id: true, createdAt: true });
export type InsertRoleApplication = z.infer<typeof insertRoleApplicationSchema>;
export type RoleApplication = typeof roleApplicationsTable.$inferSelect;
