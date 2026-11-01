"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ACLService } from "@/services/acl";
import type { Module } from "@/lib/modules";
import { groupModules } from "@/lib/workspace-navigation";

/**
 * Accessible navigation modules for the current user.
 *
 * The canonical source is `GET /auth/acl/modules`; the session's
 * `user.accessibleModules` array is used only as a fallback when the request
 * cannot be made (offline/legacy token) or fails.
 */
export function useAccessibleModules() {
  const { user, token, isLoading: authLoading } = useAuth();
  const fallback = useMemo(
    () => user?.accessibleModules ?? [],
    [user?.accessibleModules],
  );

  const query = useQuery({
    queryKey: ["acl", "modules", user?.id ?? "anonymous"],
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Module[]> => {
      if (!token) return fallback;

      try {
        return await ACLService.getAccessibleModules(token);
      } catch (error) {
        if (fallback.length > 0) return fallback;
        throw error;
      }
    },
  });

  const modules = useMemo(
    () => query.data ?? (authLoading ? [] : fallback),
    [query.data, authLoading, fallback],
  );
  const groups = useMemo(() => groupModules(modules), [modules]);

  return {
    modules,
    groups,
    loading: authLoading || query.isLoading,
    error: (query.error as Error | null) ?? null,
    refresh: () => query.refetch(),
  };
}
