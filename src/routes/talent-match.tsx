import { createFileRoute } from "@tanstack/react-router";
import { TalentMatchLayout } from "@/features/talent-match/layout/TalentMatchLayout";
import { requireTalentMatchSession } from "@/features/talent-match/auth/requireTalentMatchSession";

export const Route = createFileRoute("/talent-match")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/talent-match/login") return;
    return requireTalentMatchSession(location.pathname, location.searchStr);
  },
  component: TalentMatchLayout,
});
