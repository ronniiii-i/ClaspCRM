"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/services/api-client";
import { WorkspaceService } from "@/services/workspace";

/**
 * Loads the module definition (config, actions, scope, entity metadata) used
 * by `ModuleHost` and its renderer.
 */
export function useModuleDefinition(deptKey: string, moduleKey: string) {
  return useQuery({
    queryKey: ["workspace", "module", deptKey, moduleKey],
    queryFn: () => WorkspaceService.getModuleDefinition(deptKey, moduleKey),
    enabled: Boolean(deptKey && moduleKey),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        ApiError.is(error) &&
        (error.status === 403 || error.status === 404)
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
