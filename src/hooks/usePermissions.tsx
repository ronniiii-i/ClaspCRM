"use client";

import { useCallback } from "react";
import { ACLService } from "@/services/acl";
import type { Module, Permission, Role } from "@/lib/modules";
import { useAuth } from "./useAuth";
import { useAccessibleModules } from "./useAccessibleModules";

/**
 * Permission helper backed by the dynamic ACL payload.
 *
 * `module.actions` is authoritative; the legacy `permissions[role]` map is
 * only consulted for cached sessions created before Phase 3. If the module is
 * not in the navigation payload we ask the backend directly.
 */
export function usePermissions() {
  const { user, token } = useAuth();
  const { modules, groups, loading, error, refresh } = useAccessibleModules();

  const hasPermission = useCallback(
    async (moduleId: string, action: Permission): Promise<boolean> => {
      const found = modules.find(
        (entry: Module) => entry.id === moduleId || entry.key === moduleId,
      );

      if (found) {
        if (Array.isArray(found.actions)) {
          return found.actions.includes(action);
        }

        const roleKey =
          typeof user?.role === "string"
            ? user.role.toLowerCase()
            : user?.role?.slug ?? user?.role?.name?.toLowerCase();
        const legacy = roleKey
          ? found.permissions?.[roleKey as Role]
          : undefined;
        if (Array.isArray(legacy)) {
          return legacy.includes(action);
        }

        // A cached module with neither the new `actions` array nor the legacy
        // role map cannot answer locally; fall through to the backend.
      }

      if (!token) return false;

      try {
        return await ACLService.checkPermission(token, moduleId, action);
      } catch {
        return false;
      }
    },
    [modules, token, user?.role],
  );

  return { modules, groups, loading, error, hasPermission, refresh };
}
