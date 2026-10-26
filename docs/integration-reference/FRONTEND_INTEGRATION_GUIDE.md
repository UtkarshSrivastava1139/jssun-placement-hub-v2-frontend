# Frontend Integration Guide

This document is a safe reference for a frontend redesign agent. The main monorepo remains authoritative for contracts and backend behavior. The schemas copied into this repository are references, not independently editable sources of truth.

## Application architecture

- Framework: React 19 with TanStack Start and TanStack Router.
- Build/dev tool: Vite.
- Styling: Tailwind CSS v4 with existing Atlas design tokens and utility classes.
- UI primitives: existing Radix-based components under `src/components/ui`.
- Data: existing company read hooks plus the shared Talent Match API client.
- Tests: Vitest and Testing Library.
- Routing: file-based route modules under `src/routes`; `src/routeTree.gen.ts` is generated route metadata and must stay synchronized.

Do not convert this application to Next.js or create a second app shell.

## Routes

Public company routes:

| Route | Responsibility |
|---|---|
| `/` | Public company directory, search, filters, and company selection |
| `/company` | Company route boundary/redirect |
| `/company/intelligence` | Selected-company intelligence dossier |
| `/company/skills` | Selected-company skill roadmap |

Talent Match routes:

| Route | Responsibility |
|---|---|
| `/talent-match/login` | College-email OTP login |
| `/talent-match` | Protected Talent Match layout boundary |
| `/talent-match/` | Home progress overview |
| `/talent-match/resume-parsing` | Resume upload/extraction and review |
| `/talent-match/profile` | Editable candidate profile and 12-category self-assessment |
| `/talent-match/jd-analytics` | JD extraction, review, and saved JD management |
| `/talent-match/talent-check` | Company readiness assessment |
| `/talent-match/skill-matching` | Profile-to-saved-JD matching |

The shared Talent Match shell lives in `src/features/talent-match/layout/TalentMatchLayout.tsx`. Do not add a second header, section navigation, or footer inside a feature page.

## Shared API and authentication

Use `src/features/talent-match/api/client.ts` for Talent Match backend requests. It attaches the current Supabase bearer token and maps API errors to `TalentMatchHttpError`. Feature pages must not implement independent token handling or call Supabase tables directly.

The dedicated Auth client is `src/features/talent-match/auth/talentMatchSupabaseClient.ts`. The route guard is `src/features/talent-match/auth/requireTalentMatchSession.ts`.

Configuration names:

- `VITE_TALENT_MATCH_API_URL`
- `VITE_TALENT_MATCH_API_BASE_URL`
- `VITE_TALENT_MATCH_SUPABASE_URL`
- `VITE_TALENT_MATCH_SUPABASE_ANON_KEY`
- `VITE_ALLOW_ANONYMOUS_DEMO`
- `VITE_PORTAL_DATABASE_URL`
- `VITE_PORTAL_DATABASE_KEY`

Anonymous demo sessions are explicitly development-only and require both Supabase anonymous Auth configuration and `VITE_ALLOW_ANONYMOUS_DEMO=true`. Production should keep the flag false and use the approved login flow.

## Talent Match API endpoints

| Endpoint | Frontend responsibility |
|---|---|
| `GET /api/v1/health` | Backend health check |
| `POST /api/v1/resume-parsing/extract` | Upload PDF/DOCX resume and receive validated extraction draft |
| `GET /api/v1/profile` | Load current user's saved profile; `404 profile_not_found` is expected for a new user |
| `PUT /api/v1/profile` | Save the editable profile and return the saved record envelope |
| `DELETE /api/v1/profile` | Delete the current user's profile |
| `GET /api/v1/profile/topics` | Load the validated topic catalog |
| `POST /api/v1/profile/topics/score` | Score topic responses for one category |
| `POST /api/v1/jd-analytics/extract` | Extract a JD from PDF/DOCX or pasted text |
| `GET /api/v1/job-descriptions` | List the current user's saved JDs |
| `POST /api/v1/job-descriptions` | Save a reviewed JD extraction |
| `GET /api/v1/job-descriptions/{job_description_id}` | Load one owned saved JD |
| `PUT /api/v1/job-descriptions/{job_description_id}` | Update an owned saved JD |
| `DELETE /api/v1/job-descriptions/{job_description_id}` | Delete an owned saved JD |
| `POST /api/v1/talent-check` | Run deterministic `tc-v1` readiness scoring |
| `GET /api/v1/assessments` | List owned assessment history |
| `DELETE /api/v1/assessments` | Delete owned assessment history |
| `POST /api/v1/skill-matching` | Run deterministic `sm-v1` matching against one saved JD |

The exact request/response contract is referenced in [API_CONTRACT_REFERENCE.yaml](API_CONTRACT_REFERENCE.yaml) and the [schemas](schemas/).

## Contract-sensitive behavior

- JSON contract core version is `1.0.0`; topic assessment is an approved additive `1.1.0` extension.
- Candidate profiles contain exactly the 12 RADIX category codes: `COD`, `DSA`, `OOD`, `APTI`, `COMM`, `AI`, `CLOUD`, `SQL`, `SWE`, `SYSD`, `NETW`, `OS`.
- `OTHER` is valid for extracted profile skills but is not a Talent Check category.
- Candidate proficiency is explicit self-assessment, not extraction confidence.
- Talent Check requires all 12 category levels to be explicit integers from 1 to 10.
- Talent Check scoring is `tc-v1`; Skill Matching scoring is `sm-v1`.
- Possible/fuzzy Skill Matching results do not contribute to the score.
- Scores must be shown with explanation and gaps, never as a naked number.
- Raw resume/JD bytes are transient; saved records contain structured JSON and safe metadata only.

## Resume-to-profile handoff

Resume Parsing stores a validated draft in the frontend handoff utility under `src/features/talent-match/resume-parsing/handoff.ts`. Profile Builder consumes the draft, maps it into editable profile fields, and requires user review before save. Resume extraction confidence is not copied into self-assessed category levels.

## Profile behavior

Profile Builder loads the current user's profile. A `404 profile_not_found` response means no profile has been saved yet and should render an editable blank state. Saving uses `PUT /api/v1/profile`; the database envelope version remains compatible with the deployed `1.0.0` table constraint while the profile JSON may contain the additive topic-assessment extension.

The 12-category self-assessment UI must preserve:

- explicit level selection;
- evidence notes;
- topic response scoring;
- confirmation semantics for topic suggestions;
- visible completion state;
- save/error feedback.

## JD and matching behavior

JD Analytics returns an extraction draft first. The user reviews it before saving. Skill Matching requires a saved JD and saved profile, and displays missing skills before secondary score details. Matched, possible, and missing requirements remain distinct.

## Loading, empty, validation, and error states

Use the shared components:

- `LoadingSkeleton`
- `EmptyState`
- `ErrorState`
- `CategoryCompletionChecklist`
- `SampleDataBanner`

Use `src/features/talent-match/api/errorMessages.ts` for safe user-facing error mapping. Do not display raw server traces, provider responses, tokens, or document content.

The Talent Check synthetic preview is explicitly development-only and must show the `Sample data, not your results.` disclosure. It must never be treated as production company data.

## Files that should not be casually replaced

- `src/features/talent-match/api/client.ts`
- `src/features/talent-match/auth/talentMatchSupabaseClient.ts`
- `src/features/talent-match/auth/requireTalentMatchSession.ts`
- `src/features/talent-match/layout/TalentMatchLayout.tsx`
- `src/routeTree.gen.ts`
- `src/lib/companyApi.ts`
- `src/lib/companyData.ts`
- `src/lib/supabaseClient.ts`
- all route wrappers under `src/routes/`
- feature-level API and handoff utilities

Visual changes should be made in feature components and shared UI primitives while preserving these integration boundaries.
