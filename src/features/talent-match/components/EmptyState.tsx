import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card
      role="region"
      aria-label={`Empty state: ${title}`}
      className="border-atlas-divider bg-atlas-surface"
    >
      <CardContent className="flex flex-col items-center space-y-3 p-8 text-center sm:p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-atlas-divider bg-atlas-page text-atlas-text-secondary">
          <FileQuestion className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-lg font-bold text-atlas-ink sm:text-xl">{title}</h2>
        <p className="max-w-md text-sm text-atlas-text-secondary">{description}</p>
        {actionLabel && onAction ? (
          <Button type="button" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
