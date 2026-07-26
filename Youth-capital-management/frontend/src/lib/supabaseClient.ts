import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// When the env vars are absent the app runs in mock mode (no backend needed),
// so instead of throwing we export null and let callers fall back to mocks.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isMockMode = !supabase || !import.meta.env.VITE_API_BASE_URL;
