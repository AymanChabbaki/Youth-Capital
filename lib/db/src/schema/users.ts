import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "banned"]);
export const languagePreferenceEnum = pgEnum("language_preference", ["en", "ar"]);
export const applicationStatusEnum = pgEnum("application_status", ["none", "pending", "approved", "rejected"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  fullNameAr: text("full_name_ar"),
  role: userRoleEnum("role").notNull().default("user"),
  simulationRole: text("simulation_role"),
  region: text("region"),
  bio: text("bio"),
  languagePreference: languagePreferenceEnum("language_preference").notNull().default("en"),
  status: userStatusEnum("status").notNull().default("active"),
  applicationStatus: applicationStatusEnum("application_status").notNull().default("none"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
