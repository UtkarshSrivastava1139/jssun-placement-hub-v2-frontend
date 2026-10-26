import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AtlasFooter } from "@/components/AtlasFooter";
import { AtlasHeader } from "@/components/AtlasHeader";
import { CompanyAtlasNav } from "@/components/CompanyAtlasNav";
import { CompanyIdentityStrip } from "@/components/CompanyIdentityStrip";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompany } from "@/context/CompanyContext";

export const Route = createFileRoute("/company")({
  component: AppLayout,
});

function AppLayout() {
  const { ready, selected } = useCompany();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !selected) navigate({ to: "/", replace: true });
  }, [ready, selected, navigate]);

  return (
    <div className="atlas-page flex min-h-screen flex-col justify-between bg-atlas-page text-atlas-ink">
      <div>
        <AtlasHeader />
        {ready && selected ? (
          <>
            <div className="sticky top-0 z-30">
              <CompanyIdentityStrip
                companyId={selected.companyId}
                fallbackName={selected.companyName}
              />
              <CompanyAtlasNav />
            </div>
            <Outlet />
          </>
        ) : (
          <div className="mx-auto max-w-7xl space-y-3 px-4 py-6 sm:px-6" role="status">
            <span className="sr-only">Loading company</span>
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        )}
      </div>
      <AtlasFooter />
    </div>
  );
}
