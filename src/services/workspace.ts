import { apiRequest } from "./api-client";
import type { ModuleDefinition } from "@/lib/workspace-types";

/**
 * Typed workspace API client.
 *
 * Stage 5 wires module definitions; the record/aggregate/document helpers are
 * added alongside the renderers in Stage 6.
 */
export const WorkspaceService = {
  getModuleDefinition(
    deptKey: string,
    moduleKey: string,
  ): Promise<ModuleDefinition> {
    return apiRequest<ModuleDefinition>(
      `/workspace/modules/${encodeURIComponent(deptKey)}/${encodeURIComponent(moduleKey)}`,
      { errorMessage: "Failed to load module" },
    );
  },
};
