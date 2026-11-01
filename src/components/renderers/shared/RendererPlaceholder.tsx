import type { ModuleType } from "@/lib/modules";

const TYPE_LABELS: Record<ModuleType, string> = {
  DASHBOARD_VIEW: "dashboard",
  DATA_TABLE: "table",
  KANBAN_BOARD: "board",
  DOCUMENT_HUB: "document",
  FORM_BUILDER: "form",
};

/**
 * Stage 5 placeholder. Stage 6 replaces each registry entry with the real
 * primitive renderer; the loaded definition, actions and context are already
 * available to it.
 */
export function RendererPlaceholder({ type }: { type: ModuleType }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
      <h2 className="text-base font-semibold">Module ready</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        The {TYPE_LABELS[type]} renderer is not available in this workspace
        build yet. Configuration, permissions and data scope loaded
        successfully.
      </p>
    </div>
  );
}
