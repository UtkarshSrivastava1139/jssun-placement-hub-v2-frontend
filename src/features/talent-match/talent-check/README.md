# Talent Check Frontend Feature (Role 4)

This folder contains the UI feature components for **Role 4: Talent Check**.

For full integration specifications, refer to:
[docs/radix-talent-match/handoffs/ROLE_4_TALENT_CHECK_INTEGRATION_DOC.md](../../../../../docs/radix-talent-match/handoffs/ROLE_4_TALENT_CHECK_INTEGRATION_DOC.md)

## Component Tree

- `TalentCheckPage.tsx`: Main page component with company selection (Google, Microsoft, Oracle FSS), trigger action, loading/error states, and local preview capability.
- `components/ReadinessScoreCard.tsx`: Visual readiness meter, methodology badge (`tc-v1`), 4 metric cards, strongest categories pills, and evaluation notice card.
- `components/CategoryGapTable.tsx`: Full 12-category breakdown table with requirement vs candidate level progress indicators, gap badges, and profile evidence status tooltips.
- `types.ts`: TypeScript interfaces matching canonical schemas.
- `TalentCheckPage.test.tsx`: Vitest component tests.

## Running Tests

```powershell
npm --prefix frontend test -- src/features/talent-match/talent-check/TalentCheckPage.test.tsx
```
