export function resolveDatabaseConfig(env: Record<string, string | undefined>) {
  // Presence matters: empty local values must not fall back to platform Cloud.
  const local =
    env["VITE_PORTAL_DATABASE_URL"] !== undefined || env["VITE_PORTAL_DATABASE_KEY"] !== undefined;
  return {
    url: (local ? env["VITE_PORTAL_DATABASE_URL"] : env["VITE_SUPABASE_URL"])?.trim() ?? "",
    key: (local ? env["VITE_PORTAL_DATABASE_KEY"] : env["VITE_SUPABASE_ANON_KEY"])?.trim() ?? "",
  };
}
