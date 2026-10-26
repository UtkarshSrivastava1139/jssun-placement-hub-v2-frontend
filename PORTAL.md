# JSS University, Noida — Placement Intelligence Hub (Phase 2)

- Public, read-only: company_json supplies company JSON; four skill tables supply skills and topic ladders. No login or writes.
- College name used: JSS University, Noida (JSSUN), set in src/lib/college.ts.
- src/data/seedCompanies.ts and src/data/skillTopics.ts remain as sample fixtures/documented fallback, but are not imported by live pages.
- Optional env: VITE_LOGO_DEV_PUBLISHABLE_KEY for company logos.
- For independent local work, run npm install, npm run setup:local, fill in .env.local with your own database settings, then npm run dev:local. See README.md for Node production commands and required tables. No Lovable Cloud session is needed.
