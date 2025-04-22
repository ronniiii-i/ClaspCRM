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
  HOD = "HOD",
  LEAD = "LEAD",
  STAFF = "STAFF",
}

const roleHierarchy = {
  [AccessLevel.ADMIN]: 3,
  [AccessLevel.HOD]: 2,
  [AccessLevel.LEAD]: 1,
  [AccessLevel.STAFF]: 0,
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

   if (user.role === AccessLevel.HOD) {
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
