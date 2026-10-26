import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function CompanyDataState({ error, retry }: { error?: Error | null; retry: () => void }) {
  return (
    <div
      className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6"
      role={error ? "alert" : "status"}
    >
      {error ? (
        <div className="mx-auto max-w-lg rounded-lg border border-atlas-divider bg-atlas-surface p-8 text-center shadow-2xs">
          <p className="text-sm font-medium text-atlas-danger">{error.message}</p>
          <p className="mt-1 text-xs text-atlas-text-secondary">
            Please check your database connectivity and retry.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-atlas-divider text-atlas-ink hover:bg-atlas-page"
            onClick={retry}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <span className="sr-only">Loading company data</span>
          <div className="hidden gap-8 lg:grid lg:grid-cols-[220px_1fr]">
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-8 rounded-md" />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4 lg:hidden">
            <Skeleton className="h-10 rounded-lg" />
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
