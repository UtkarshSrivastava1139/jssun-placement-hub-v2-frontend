import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface LoadingSkeletonProps {
  label?: string;
  rows?: number;
}

export function LoadingSkeleton({
  label = "Loading Talent Match data…",
  rows = 3,
}: LoadingSkeletonProps) {
  return (
    <div role="status" aria-live="polite" aria-label={label} className="space-y-4">
      <span className="sr-only">{label}</span>
      <Card className="border-atlas-divider bg-atlas-surface shadow-xs">
        <CardHeader className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: rows }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
