import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ensureTalentMatchSession } from "@/features/talent-match/auth/talentMatchSupabaseClient";
import { JdAnalyticsPage } from "@/features/talent-match/jd-analytics/JdAnalyticsPage";
import {
  extractJobDescription,
  saveJobDescription,
} from "@/features/talent-match/jd-analytics/api";

export const Route = createFileRoute("/talent-match/jd-analytics")({
  head: () => ({
    meta: [
      { title: "JD Analytics — JSSUN Placement Intelligence Hub" },
      {
        name: "description",
        content: "Review evidence-backed job description skill requirements.",
      },
    ],
  }),
  component: JdAnalyticsRoute,
});

function JdAnalyticsRoute() {
  useEffect(() => {
    void ensureTalentMatchSession().catch(() => {});
  }, []);

  return (
    <JdAnalyticsPage
      onExtract={extractJobDescription}
      onSave={async (draft) => {
        await saveJobDescription(draft);
      }}
    />
  );
}
