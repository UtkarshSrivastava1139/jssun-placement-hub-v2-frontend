import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface ErrorStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  actionLabel = "Retry",
  onAction,
}: ErrorStateProps) {
  return (
    <Card role="alert" aria-label={title} className="border-atlas-danger/30 bg-atlas-surface">
      <CardContent className="flex flex-col items-center space-y-3 p-8 text-center sm:p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-atlas-danger/30 bg-atlas-danger/5 text-atlas-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-lg font-bold text-atlas-ink sm:text-xl">{title}</h2>
        <p className="max-w-md text-sm text-atlas-text-secondary">{message}</p>
        {onAction ? (
          <Button type="button" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
