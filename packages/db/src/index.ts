import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Explicitly re-export core identifiers to resolve Node16/ESM deep-reexport failures
export { usersTable, userRoleEnum, userStatusEnum, languagePreferenceEnum, applicationStatusEnum, insertUserSchema, type User, type InsertUser } from "./schema/users.js";

// Keep global export for local convenience (IDE visibility)
export * from "./schema/index.js";
