import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Service-role client: bypasses RLS, so every access-control decision
// in this backend MUST be enforced explicitly in the middlewares /
// services below. Never expose this client or this key to the frontend.
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

// Helper: the schema name for a given jiha code, matching
// create_jiha_schema() in the DB migrations.
export function jihaSchema(jihaCode: string): string {
  return `jiha_${jihaCode}`;
}
