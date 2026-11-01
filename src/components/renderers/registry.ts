import { createElement } from "react";
import type { ModuleType } from "@/lib/modules";
import type { ModuleRenderer, ModuleRendererProps } from "./types";
import { RendererPlaceholder } from "./shared/RendererPlaceholder";

function PlaceholderRenderer({ definition }: ModuleRendererProps) {
  return createElement(RendererPlaceholder, { type: definition.type });
}

/**
 * Renderer dispatch table.
 *
 * Stage 5 ships placeholders so the dynamic route and shell can be verified
 * independently. Stage 6 will replace each entry with the primitive renderer.
 */
export const rendererRegistry: Partial<Record<ModuleType, ModuleRenderer>> = {
  DASHBOARD_VIEW: PlaceholderRenderer,
  DATA_TABLE: PlaceholderRenderer,
  KANBAN_BOARD: PlaceholderRenderer,
  DOCUMENT_HUB: PlaceholderRenderer,
  FORM_BUILDER: PlaceholderRenderer,
};

export function getRenderer(type: ModuleType): ModuleRenderer | undefined {
  return rendererRegistry[type];
}
