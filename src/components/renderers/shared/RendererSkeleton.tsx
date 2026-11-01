import { Skeleton } from "@/components/ui/skeleton";
import type { ModuleType } from "@/lib/modules";

const TYPE_LABELS: Record<ModuleType, string> = {
  DASHBOARD_VIEW: "Loading dashboard",
  DATA_TABLE: "Loading records",
  KANBAN_BOARD: "Loading board",
  DOCUMENT_HUB: "Loading documents",
  FORM_BUILDER: "Loading form",
};

/** Type-aware placeholder shown while a module definition or renderer loads. */
export function RendererSkeleton({ type }: { type?: ModuleType }) {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label={type ? TYPE_LABELS[type] : "Loading module"}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
