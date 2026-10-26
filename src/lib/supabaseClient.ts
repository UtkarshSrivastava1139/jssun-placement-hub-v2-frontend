import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { resolveDatabaseConfig } from "./databaseConfig";

let client: SupabaseClient | undefined;

/** Lazy, sessionless, public-key-only access. */
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  const { url, key } = resolveDatabaseConfig(import.meta.env);
  if (!url || !key) {
    const message =
      "Database connection is not configured. Set VITE_PORTAL_DATABASE_URL and VITE_PORTAL_DATABASE_KEY in .env.local, then restart development.";
    console.error(message);
    throw new Error(message);
  }
  if (key.startsWith("sb_secret_"))
    throw new Error("Use a public anon key, never a secret key, for this read-only portal.");
  client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: undefined,
    },
  });
  return client;
}
