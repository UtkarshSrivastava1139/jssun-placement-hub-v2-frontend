import { createFileRoute } from "@tanstack/react-router";

import { ProfileBuilderPage } from "@/features/talent-match/profile-builder/ProfileBuilderPage";

export const Route = createFileRoute("/talent-match/profile")({
  component: ProfileBuilderPage,
});
