import { createFileRoute } from "@tanstack/react-router";
import { ResumeParsingPage } from "@/features/talent-match/resume-parsing";

export const Route = createFileRoute("/talent-match/resume-parsing")({
  component: ResumeParsingRoute,
});

function ResumeParsingRoute() {
  return <ResumeParsingPage />;
}
