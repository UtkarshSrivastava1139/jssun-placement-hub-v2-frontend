import { createFileRoute } from "@tanstack/react-router";
import { TalentMatchHomePage } from "@/features/talent-match/home/TalentMatchHomePage";

export const Route = createFileRoute("/talent-match/")({
  component: TalentMatchHomePage,
});
