"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkspaceService } from "@/services/workspace";
import type { DocumentInput, DocumentListQuery } from "@/lib/workspace-types";

const documentsKey = (deptKey: string, moduleKey: string) =>
  ["workspace", "documents", deptKey, moduleKey] as const;

export function useDocuments(
  deptKey: string,
  moduleKey: string,
  query: DocumentListQuery,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [...documentsKey(deptKey, moduleKey), query],
    queryFn: () => WorkspaceService.listDocuments(deptKey, moduleKey, query),
    enabled: Boolean(deptKey && moduleKey) && (options.enabled ?? true),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

/** Full document (list responses omit `content`). */
export function useDocument(
  deptKey: string,
  moduleKey: string,
  id: string | null,
) {
  return useQuery({
    queryKey: ["workspace", "document", deptKey, moduleKey, id],
    queryFn: () => WorkspaceService.getDocument(deptKey, moduleKey, id as string),
    enabled: Boolean(deptKey && moduleKey && id),
    staleTime: 60 * 1000,
  });
}

export function useDocumentMutations(deptKey: string, moduleKey: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: documentsKey(deptKey, moduleKey),
    });
    void queryClient.invalidateQueries({
      queryKey: ["workspace", "document", deptKey, moduleKey],
    });
  };

  const create = useMutation({
    mutationFn: (input: DocumentInput) =>
      WorkspaceService.createDocument(deptKey, moduleKey, input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: DocumentInput }) =>
      WorkspaceService.updateDocument(deptKey, moduleKey, id, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: ({ id, hard }: { id: string; hard?: boolean }) =>
      WorkspaceService.deleteDocument(deptKey, moduleKey, id, hard),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
