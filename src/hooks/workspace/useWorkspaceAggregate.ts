"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkspaceService } from "@/services/workspace";
import type {
  AggregateResponse,
  DashboardWidget,
} from "@/lib/workspace-types";

/** Map a dashboard widget onto the bounded aggregate request contract. */
export function toAggregateInput(widget: DashboardWidget) {
  return {
    id: widget.id,
    entity: widget.entity,
    aggregation: widget.aggregation,
    field: widget.field || null,
    timeframe: widget.timeframe,
    filters: widget.filters.map((filter) => ({
      field: filter.field,
      op: filter.op,
      value: filter.value,
    })),
    groupBy: widget.groupBy,
  };
}

/**
 * One batched aggregate request for every dashboard widget. The backend
 * isolates per-widget failures, so a single bad widget never blanks the page.
 */
export function useDashboardAggregate(
  deptKey: string,
  moduleKey: string,
  widgets: DashboardWidget[],
) {
  const enabled = Boolean(deptKey && moduleKey) && widgets.length > 0;

  return useQuery<AggregateResponse>({
    queryKey: ["workspace", "aggregate", deptKey, moduleKey, widgets],
    queryFn: () =>
      WorkspaceService.aggregate(
        deptKey,
        moduleKey,
        widgets.slice(0, 12).map(toAggregateInput),
      ),
    enabled,
    staleTime: 60 * 1000,
  });
}

/** Persist a renderer config (tenant-admin only, enforced server-side). */
export function useUpdateModuleConfig(deptKey: string, moduleKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Record<string, unknown>) =>
      WorkspaceService.updateConfig(deptKey, moduleKey, config),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace", "module", deptKey, moduleKey],
      });
      void queryClient.invalidateQueries({
        queryKey: ["workspace", "aggregate", deptKey, moduleKey],
      });
      void queryClient.invalidateQueries({ queryKey: ["acl"] });
    },
  });
}
