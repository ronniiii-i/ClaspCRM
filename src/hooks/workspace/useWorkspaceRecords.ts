"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { WorkspaceService } from "@/services/workspace";
import type {
  RecordsPage,
  RecordsQuery,
  WorkspaceRecord,
} from "@/lib/workspace-types";

const recordsKey = (deptKey: string, moduleKey: string) =>
  ["workspace", "records", deptKey, moduleKey] as const;

/** Paginated, sorted and filtered module records. */
export function useWorkspaceRecords(
  deptKey: string,
  moduleKey: string,
  query: RecordsQuery,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [...recordsKey(deptKey, moduleKey), query],
    queryFn: () => WorkspaceService.listRecords(deptKey, moduleKey, query),
    enabled: Boolean(deptKey && moduleKey) && (options.enabled ?? true),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export interface RecordMutationContext {
  snapshots?: Array<[readonly unknown[], RecordsPage | undefined]>;
}

/**
 * Record mutations for a module.
 *
 * `transition` applies an optimistic status change to every cached page of
 * the module, then rolls back if the backend rejects the move. This keeps the
 * Kanban board responsive without trusting the client with a column write.
 */
export function useWorkspaceRecordMutations(
  deptKey: string,
  moduleKey: string,
  statusField = "status",
) {
  const queryClient = useQueryClient();
  const moduleRecordsKey = recordsKey(deptKey, moduleKey);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: moduleRecordsKey });
    void queryClient.invalidateQueries({ queryKey: ["workspace", "aggregate"] });
  };

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      WorkspaceService.createRecord(deptKey, moduleKey, body),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Record<string, unknown>;
    }) => WorkspaceService.updateRecord(deptKey, moduleKey, id, body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      WorkspaceService.deleteRecord(deptKey, moduleKey, id),
    onSuccess: invalidate,
  });

  const transition = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      WorkspaceService.transitionRecord(
        deptKey,
        moduleKey,
        id,
        status,
      ) as Promise<WorkspaceRecord>,
    onMutate: async ({ id, status }): Promise<RecordMutationContext> => {
      await queryClient.cancelQueries({ queryKey: moduleRecordsKey });

      const snapshots = queryClient.getQueriesData<RecordsPage>({
        queryKey: moduleRecordsKey,
      });

      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<RecordsPage>(key, {
          ...page,
          data: page.data.map((row) =>
            row.id === id ? { ...row, [statusField]: status } : row,
          ),
        });
      }

      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: invalidate,
  });

  return { create, update, remove, transition };
}
