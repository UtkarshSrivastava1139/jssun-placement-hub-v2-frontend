<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Placement portal rules

- Live data flows through public read-only React Query hooks in src/lib/companyApi.ts and the unchanged pure normalizers in src/lib/companyData.ts; why: JSON compatibility keeps presentation independent of the database.
- The selected company is persisted in localStorage ("selected-company") via CompanyContext and read only after hydration; why: pages must survive refresh without SSR mismatches.
- Field filtering in normalizeCompanyProfile drops forbidden keys centrally; why: forbidden fields can never leak into any page.
- src/lib/supabaseClient.ts creates a lazy sessionless client using local portal settings first, with legacy settings supported only when local settings are absent; why: downloaded Cloud settings must not override the user's explicit local setup.
- CompanyContext stores selection metadata only, not fetched rows; why: database company IDs must survive refresh without seed validation.
- Assemble skills and ten-level topic arrays in companyApi using ID maps across the four approved skill tables; why: no company-table joins or live seed dependencies are allowed.
- Standalone local commands use vite.local.config.ts with standard plugins and a Node server target; the managed preview keeps vite.config.ts; why: local work must not require Lovable tooling or Cloud runtime services.
- The public portal does not register Cloud authentication middleware; why: read-only anonymous database calls do not need platform sessions.
