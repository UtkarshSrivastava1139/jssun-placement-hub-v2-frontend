# Phase 2

- [x] Prepare independent local startup, Node build settings, and database configuration instructions. Standalone localhost returned HTTP 200 and rendered the portal title; eleven tests pass. Production local build has not been exercised.
- [x] Add read-only company and skill queries with existing normalizers.
- [x] Rewire list, selection, detail and roadmaps with loading/error/retry states.
- [x] Document configuration and retained sample fallback.
- [x] Run compatibility tests and browser checks: nine tests pass; retry and no-selection redirect verified; no uncaught browser errors; build OK.
- [x] Verify populated company profiles and skill roadmaps: Connected to live Supabase database with 118 company rows, configured anon RLS SELECT policies on company_json and the 4 skill tables, and verified full company intelligence sections and 10-level skill topic ladders.

# Phase 3A — Campus Atlas + Adaptive Directory (Homepage Redesign)

- [x] Downloaded design references (Airtable & IBM) to `docs/design-references/` without overwriting root `DESIGN.md`.
- [x] Added Campus Atlas design system tokens (`--atlas-page`, `--atlas-surface`, `--atlas-ink`, `--atlas-terracotta`, `--atlas-text-secondary`, `--atlas-divider`, `--atlas-selected`, `--atlas-focus`) scoped under `.atlas-page`.
- [x] Implemented institutional header distinguishing university identity (`JSSUN`, `JSS University, Noida`) and product title (`Placement Intelligence Hub`) with live record indicator (`118 Organizations Indexed`) and 2px terracotta architectural accent.
- [x] Built compact editorial introduction preserving approved copy and integrated debounced search (200ms) with clear button.
- [x] Implemented placement category segmented filter control (All, Super Dream, Dream, Standard, Regular) with live counts.
- [x] Implemented responsive 4-column Grid layout (>=1280px: 4 cols, 1024-1279px: 3 cols, 640-1023px: 2 cols, <640px: 1 col).
- [x] Implemented structured List view with aligned table columns on desktop and responsive stacked rows on mobile.
- [x] Built accessible Grid/List switcher with default-to-grid on fresh visit (transient state, no persistence) and state preservation (search/filter/selection intact across mode switches).
- [x] View-adaptive loading skeletons matching Grid and List anatomy.
- [x] Implemented alphabetical company sorting (A–Z, #), letter section dividers with organization counts and fine rules in both Grid and List modes, and an interactive A–Z Quick Jump Index ribbon with smooth scrolling and dynamic search/filter awareness.
- [x] Redesigned Company Card anatomy: prominent 56px (`size-14`) logo avatar, tier-colored top hairline accent stripe, structured 2-column research data tiles (HQ, Size, YoY Trend pill using Lucide icons with zero emojis), matching view-adaptive skeletons, and smooth micro-lift hover elevation (`-translate-y-1`).
- [x] Verified full Vitest test suite (11/11 tests passing), ESLint checks, Nitro/Vite production build (`npm run build:local`), and end-to-end browser verification across desktop, tablet, and mobile.

# Campus Atlas Frontend (Presentation System)

- [x] **Atlas Tokens**: Promoted `.atlas-page` design tokens in [src/styles.css](file:///d:/Projects/JSS%20Placement%20Intelligence/src/styles.css) to shared utilities (`bg-atlas-page`, `text-atlas-ink`, `border-atlas-divider`, `bg-atlas-surface`, etc.) and applied across homepage (`/`) and company routes (`/company/*`).
- [x] **Homepage Consistency**: Responsive A–Z jump index ribbon with touch scroll clustering, unified missing data copy to "Not publicly available", and enhanced `CompanyLogo` to handle semicolon-delimited URLs, direct image domains, and high-resolution fallbacks.
- [x] **Company Atlas Shell**: Replaced the generic dashboard sidebar with a unified institutional `AtlasHeader`, sticky identity strip (`CompanyIdentityStrip` with logo, tier badge, category, website, and LinkedIn), and compact editorial switcher between Research dossier and Skill ladder (`CompanyAtlasNav`).
- [x] **Research Dossier**: Redesigned 22-section profile grouped into 5 thematic chapters (_The firm_, _Market_, _Work_, _Trust_, _Reach_), sticky desktop chapter TOC, section coverage chips (e.g., `8/8`), automatic hiding of empty rows, and strict enforcement of zero forbidden fields (`ctc`, `stipend`, `selection_ratio`).
- [x] **Skill Preparation Ladder**: Compact Bloom's Taxonomy & Criticality legend strip, client-side criticality filter chips (All, Critical, Important, Baseline), auto-expanded Critical skills by default, 10-level progress ladder rows, and muted handling of unpublished topics.
- [x] **Verification**: 11/11 Vitest tests passing, 0 ESLint errors, clean local production build (`npm run build:local`), and comprehensive browser validation covering directory search, list/grid modes, A-Z jump, company navigation, direct localStorage hydration, chapter jumping, skill filters, and mobile viewports.
