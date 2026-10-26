import { createFileRoute } from "@tanstack/react-router";
import { TalentMatchLoginPage } from "@/features/talent-match/auth/TalentMatchLoginPage";

export const Route = createFileRoute("/talent-match/login")({
  component: TalentMatchLoginPage,
});
