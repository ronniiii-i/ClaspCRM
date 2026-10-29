"use client";

import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shared dashboard states. Every role view renders the same empty/error
 * treatment so a slow or failing scoped endpoint is obvious instead of
 * silently rendering zeroed widgets.
 */

export function DashboardError({
  title = "We could not load this dashboard",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-10 text-center"
    >
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {message ?? "Something went wrong while fetching your data."}
        </p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function DashboardEmpty({
  title = "Nothing to show yet",
  description = "There is no data for your scope yet. It will appear here as soon as records are added.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
