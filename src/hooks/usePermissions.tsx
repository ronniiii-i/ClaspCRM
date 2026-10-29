"use client";

import { useState, useEffect } from "react";
import { ACLService } from "@/services/acl";
import { useAuth } from "./useAuth";
import { Module, Permission } from "@/lib/modules";

export function usePermissions() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (user?.accessibleModules) {
      setModules(user.accessibleModules);
      setLoading(false);
      setError(null);
    } else if (!user && !token) {
      setModules([]);
      setLoading(false);
      setError(new Error("User not authenticated."));
    } else {
      setLoading(false);
      setError(new Error("Could not retrieve user permissions."));
    }
  }, [user, token, authLoading]);

  const hasPermission = async (
    moduleId: string,
    action: Permission,
  ): Promise<boolean> => {
    if (!token || !user) return false;

    // Fast path: check locally from accessible modules
    const foundModule = modules.find((m) => m.id === moduleId);
    if (foundModule) {
      const rolePermissions =
        foundModule.permissions[
          user.role as keyof typeof foundModule.permissions
        ];
      return rolePermissions?.includes(action) ?? false;
    }

    // Fallback: ask the backend
    try {
      return await ACLService.checkPermission(token, moduleId, action);
    } catch {
      return false;
    }
  };

  return { modules, loading, error, hasPermission };
}
