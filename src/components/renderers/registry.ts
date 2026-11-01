import type { ModuleType } from "@/lib/modules";
import type { ModuleRenderer } from "./types";
import { DashboardRenderer } from "./DashboardRenderer";
import { DataTableRenderer } from "./DataTableRenderer";
import { DocumentRenderer } from "./DocumentRenderer";
import { FormRenderer } from "./FormRenderer";
import { KanbanRenderer } from "./KanbanRenderer";

/**
 * Renderer dispatch table.
 *
 * Stage 6 replaces the Stage 5 placeholders with the five primitive renderers.
 * Every renderer receives the loaded module definition and reads permissions,
 * entity metadata and data scope from `ModuleContext`.
 */
export const rendererRegistry: Record<ModuleType, ModuleRenderer> = {
  DASHBOARD_VIEW: DashboardRenderer,
  DATA_TABLE: DataTableRenderer,
  KANBAN_BOARD: KanbanRenderer,
  DOCUMENT_HUB: DocumentRenderer,
  FORM_BUILDER: FormRenderer,
};

export function getRenderer(type: ModuleType): ModuleRenderer | undefined {
  return rendererRegistry[type];
}
