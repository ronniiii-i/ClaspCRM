import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shared error state with an optional retry and action slot. */
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  action,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card px-6 py-12 text-center"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <h2 className="text-base font-semibold">{title}</h2>
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}
