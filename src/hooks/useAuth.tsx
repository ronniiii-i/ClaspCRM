"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/lib/modules";

/**
 * Shared session hook.
 *
 * All state lives in {@link useAuthStore}, so every component that calls
 * `useAuth` reads the same token/user and, crucially, only one component
 * triggers the initial `/auth/verify` request.
 */
export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialize = useAuthStore((state) => state.initialize);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const refreshUserData = useAuthStore((state) => state.refreshUserData);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const hasRole = (requiredRoles: string[]) =>
    user ? requiredRoles.includes(user.role) : false;

  const getPrimaryDepartment = (): AuthUser["department"] => {
    if (!user) return null;
    return user.managedDepartment ?? user.department ?? null;
  };

  return {
    token,
    user,
    isLoading,
    register,
    login,
    logout,
    hasRole,
    isAdmin: () => hasRole(["ADMIN"]),
    isManager: () => hasRole(["HOD", "ADMIN"]),
    refreshUserData,
    getDepartment: getPrimaryDepartment,
  };
}
