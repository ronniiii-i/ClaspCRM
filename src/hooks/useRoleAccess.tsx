// src/hooks/useRoleAccess.tsx
"use client";

import { useAuth } from "./useAuth";
import { ALL_MODULES, Department, AccessLevel } from "@/lib/modules";

export function useRoleAccess() {
  const { user } = useAuth();

  const getAccessibleModules = () => {
    if (!user?.role) return [];

    return ALL_MODULES.filter((module) => {
      // Admin sees all modules
      if (user.role === "ADMIN") return true;

      // Department check (if module is department-specific)
      if (module.department && module.department !== user.department?.name) {
        return false;
      }

      // Role-based access (must have at least one permission)
      const rolePermissions =
        module.roles[user.role as keyof typeof module.roles];
      return rolePermissions && rolePermissions.length > 0;
    });
  };

  const hasPermission = (moduleId: string, action: AccessLevel) => {
    if (!user?.role) return false;
    const foundModule = ALL_MODULES.find((m) => m.id === moduleId);
    if (!foundModule) return false;
    return (
      foundModule.roles[user.role as keyof typeof foundModule.roles]?.includes(action) ??
      false
    );
  };

  return {
    getAccessibleModules,
    hasPermission,
    currentRole: user?.role,
    currentDepartment: user?.department?.name,
    canAccessDepartment: (dept: Department) =>
      user?.role === "ADMIN" || user?.department?.name === dept,
  };
}
