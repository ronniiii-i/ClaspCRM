// src/hooks/useRoleAccess.tsx
"use client";

import { useAuth } from "./useAuth";
import {
  // Department,
  ALL_MODULES,
  Module,
} from "@/lib/modules";

export enum AccessLevel {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
  GUEST = "GUEST",
}

const roleHierarchy = {
  [AccessLevel.ADMIN]: 3,
  [AccessLevel.MANAGER]: 2,
  [AccessLevel.USER]: 1,
  [AccessLevel.GUEST]: 0,
};

export function useRoleAccess() {
  const { user } = useAuth();

  if (!user || !user.role) {
    return {
      userRole: null,
      canAccess: () => false,
      requiresRole: () => () => false,
      getAccessibleModules: () => [],
    };
  }

  const canAccess = (minRole: AccessLevel): boolean => {
    const userRoleLevel = roleHierarchy[user.role as AccessLevel] || 0;
    const requiredLevel = roleHierarchy[minRole];
    return userRoleLevel >= requiredLevel;
  };

  const requiresRole = (minRole: AccessLevel) => {
    return (children: React.ReactNode): React.ReactNode => {
      return canAccess(minRole) ? children : null;
    };
  };

  // Update the getAccessibleModules function
  const getAccessibleModules = (): Module[] => {
    if (user.role === AccessLevel.ADMIN) {
      return ALL_MODULES;
    }

   const userDepartment = user.department?.name || "";
   const managedDepartment = user.managedDepartment?.name || "";

   if (user.role === AccessLevel.MANAGER) {
     return ALL_MODULES.filter(
       (module) =>
         !module.department || // Modules available to all
         userDepartment === module.department ||
         managedDepartment === module.department ||
         module.id === "analytics" // Cross-department module
     );
   }

   // For regular users
   return ALL_MODULES.filter(
     (module) => !module.department || userDepartment === module.department
   );
  };
  // const modules = getAccessibleModules();
  // console.log("Accessible modules:", modules);
  // console.log("User department:", user.department);

  return {
    userRole: user.role as AccessLevel,
    canAccess,
    requiresRole,
    getAccessibleModules,
  };
}
