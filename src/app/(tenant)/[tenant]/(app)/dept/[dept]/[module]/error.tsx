"use client";

import { ErrorState } from "@/components/renderers/shared/ErrorState";

export default function ModuleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Could not load this module"
      message={error.message}
      onRetry={reset}
    />
  );
}
