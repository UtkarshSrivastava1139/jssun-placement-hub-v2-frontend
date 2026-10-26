import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function getTalentMatchSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url =
    import.meta.env["VITE_TALENT_MATCH_SUPABASE_URL"] ||
    import.meta.env["VITE_SUPABASE_URL"];
  const key =
    import.meta.env["VITE_TALENT_MATCH_SUPABASE_ANON_KEY"] ||
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    import.meta.env["VITE_SUPABASE_ANON_KEY"];
  if (!url || !key) {
    throw new Error(
      "Talent Match authentication is not configured. Set the approved Supabase public environment variables.",
    );
  }
  if (key.startsWith("sb_secret_")) {
    throw new Error("Talent Match requires a public Supabase key, never a secret key.");
  }

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

export async function ensureTalentMatchSession(): Promise<void> {
  const supabase = getTalentMatchSupabaseClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session && import.meta.env["VITE_ALLOW_ANONYMOUS_DEMO"] === "true") {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw new Error(`Unable to start Talent Match session: ${error.message}`);
  }
}

export function isAnonymousDemoAllowed(): boolean {
  return import.meta.env["VITE_ALLOW_ANONYMOUS_DEMO"] === "true";
}

export async function getTalentMatchSession() {
  const { data } = await getTalentMatchSupabaseClient().auth.getSession();
  return data.session;
}
