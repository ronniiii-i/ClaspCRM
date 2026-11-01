"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkspaceService } from "@/services/workspace";

const submissionsKey = (deptKey: string, moduleKey: string) =>
  ["workspace", "submissions", deptKey, moduleKey] as const;

export function useSubmissions(
  deptKey: string,
  moduleKey: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [...submissionsKey(deptKey, moduleKey), { page: 1, pageSize: 25 }],
    queryFn: () =>
      WorkspaceService.listSubmissions(deptKey, moduleKey, {
        page: 1,
        pageSize: 25,
      }),
    enabled: Boolean(deptKey && moduleKey) && (options.enabled ?? true),
    staleTime: 30 * 1000,
  });
}

export function useSubmitForm(deptKey: string, moduleKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      WorkspaceService.submitForm(deptKey, moduleKey, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: submissionsKey(deptKey, moduleKey),
      });
      void queryClient.invalidateQueries({
        queryKey: ["workspace", "records", deptKey, moduleKey],
      });
    },
  });
}
