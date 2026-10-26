import { createFileRoute } from "@tanstack/react-router";
import { TalentCheckPage } from "@/features/talent-match/talent-check/TalentCheckPage";

export const Route = createFileRoute("/talent-match/talent-check")({
  head: () => ({
    meta: [
      { title: "Talent Check — JSSUN Placement Intelligence Hub" },
      {
        name: "description",
        content: "Evaluate candidate readiness across 12 RADIX categories against target company expectations.",
      },
    ],
  }),
  component: TalentCheckRoute,
});

function TalentCheckRoute() {
  return <TalentCheckPage />;
}
