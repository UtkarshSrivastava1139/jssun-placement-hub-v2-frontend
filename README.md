# JSSUN Placement Hub v2 — Frontend Redesign Workspace

This repository is a frontend-only redesign workspace for the RADIX Talent Match and JSS University Placement Intelligence Hub application.

The existing monorepo remains the authoritative source of truth:

`https://github.com/UtkarshSrivastava1139/jssun-placement-hub_v2`

The Figma Make project is a visual and interaction reference only. **Use the Figma Make design as a visual and interaction reference. Do not replace the existing application architecture with the reference project's framework or backend.**

## Scope

This copy preserves the existing React/TanStack Start frontend, including:

- Public company intelligence routes and existing data flows.
- Talent Match routes for Resume Parsing, Profile Builder, JD Analytics, Talent Check, and Skill Matching.
- Existing API client, Supabase session handling, design tokens, components, assets, tests, and generated route metadata.
- Real backend integrations and request/response contracts.

The redesign scope includes the application shell, navigation, shared components, page composition, responsive behavior, accessibility, and loading/error/empty states. Backend, database, schema, scoring, and authentication-provider changes are outside the visual redesign scope unless separately approved.

## Run locally

Requirements: Node.js 22.x and npm 11.x (the source validation environment used Node `v22.14.0` and npm `11.17.0`).

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

The default local frontend is served at `http://localhost:8080/`.

Set these variables in `.env.local` with local values:

```env
VITE_PORTAL_DATABASE_URL=
VITE_PORTAL_DATABASE_KEY=
VITE_TALENT_MATCH_SUPABASE_URL=
VITE_TALENT_MATCH_SUPABASE_ANON_KEY=
VITE_TALENT_MATCH_API_URL=http://localhost:8000
VITE_TALENT_MATCH_API_BASE_URL=http://localhost:8000
VITE_ALLOW_ANONYMOUS_DEMO=false
```

Only public Supabase URL and publishable/anon keys belong in frontend variables. Never add service-role keys, `sb_secret_` keys, database passwords, access tokens, resumes, or candidate records.

## Commands

```powershell
npm run dev
npm run build
npm test -- --maxWorkers=1 --testTimeout=15000
npm run lint
```

The backend must be running separately for authenticated Talent Match flows:

```text
http://localhost:8000
```

## Design-agent rules

1. Keep React, TanStack Start/Router, Vite, Tailwind, and the existing component conventions.
2. Keep all existing routes and real API integrations working.
3. Do not replace API calls with mock success responses.
4. Do not change backend contracts, database schemas, scoring logic, or authentication behavior as part of visual redesign.
5. Keep the five Talent Match modules connected to their actual APIs.
6. Preserve loading, empty, validation, success, and safe error states.
7. Keep company intelligence pages and their public read-only data behavior intact.
8. Review approved UI changes against the source repository before integrating them back.

See [FRONTEND_INTEGRATION_GUIDE.md](docs/integration-reference/FRONTEND_INTEGRATION_GUIDE.md) for routes, API boundaries, contracts, auth, and integration-sensitive files.
