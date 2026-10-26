import { existsSync, writeFileSync } from "node:fs";

const path = new URL("../.env.local", import.meta.url);
if (existsSync(path)) {
  console.log(".env.local already exists; your settings were left unchanged.");
} else {
  writeFileSync(
    path,
    [
      "# Your own database URL and public anon/publishable key. No Lovable Cloud required.",
      "# These override any platform-managed database settings in the downloaded .env.",
      "VITE_PORTAL_DATABASE_URL=",
      "VITE_PORTAL_DATABASE_KEY=",
      "",
    ].join("\n"),
  );
  console.log("Created .env.local. Fill in both database settings, then run npm run dev:local.");
}
