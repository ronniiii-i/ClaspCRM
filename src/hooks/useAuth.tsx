"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  login as loginAPI,
  logout as logoutAPI,
  getToken,
  register as registerAPI,
  initializeSessionTracking,
  setupTokenRefresh,
} from "@/lib/auth";
import { AuthUser } from "@/lib/modules";
import { jwtDecode } from "jwt-decode";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const clearAuthData = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logoutAPI();
    } catch {
      clearAuthData();
      router.push("/login");
    } finally {
      setToken(null);
      setUser(null);
    }
  }, [clearAuthData, router]);

  const verifyToken = useCallback(
    async (currentToken: string): Promise<AuthUser> => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/verify`, {
        headers: { Authorization: `Bearer ${currentToken}` },
        credentials: "include",
      });

      if (!res.ok) {
        clearAuthData();
        throw new Error("Invalid token or session expired");
      }

      const data = await res.json();
      return data.user as AuthUser;
    },
    [clearAuthData],
  );

  useEffect(() => {
    if (initialized) return;

    const initializeAuth = async () => {
      setIsLoading(true);
      const storedToken = getToken();
      setToken(storedToken);

      if (storedToken) {
        try {
          const cachedUser =
            typeof window !== "undefined"
              ? localStorage.getItem("auth_user")
              : null;

          let userData: AuthUser;
          if (cachedUser) {
            userData = JSON.parse(cachedUser);
            setUser(userData);
          } else {
            userData = await verifyToken(storedToken);
            setUser(userData);
            if (typeof window !== "undefined") {
              localStorage.setItem("auth_user", JSON.stringify(userData));
            }
          }

          try {
            const decoded = jwtDecode<{ exp: number }>(storedToken);
            const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
            setupTokenRefresh(expiresIn);
            initializeSessionTracking();
          } catch {
            handleLogout();
          }
        } catch {
          handleLogout();
        }
      }

      setIsLoading(false);
      setInitialized(true);
    };

    initializeAuth();
  }, [initialized, handleLogout, verifyToken]);

  const refreshUserData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const freshUserData = await verifyToken(token);
      setUser(freshUserData);
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(freshUserData));
      }
      return freshUserData;
    } catch {
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  }, [token, verifyToken, handleLogout]);

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await registerAPI(email, password, name);
      if (!response.success) throw new Error(response.message);
      return {
        success: true,
        message:
          "Registration successful! Please check your email for verification.",
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error("Registration failed");
    }
  };

  const login = async (email: string, password: string) => {
    const response = await loginAPI(email, password);

    if (!response.accessToken || !response.user) {
      throw new Error("Login failed: Invalid response from server");
    }

    const { accessToken, user: userData } = response;

    if (!userData.isVerified) {
      throw new Error("Please verify your email before logging in");
    }

    setToken(accessToken);
    setUser(userData);

    try {
      const decoded = jwtDecode<{ exp: number }>(accessToken);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      setupTokenRefresh(expiresIn);
      initializeSessionTracking();
    } catch {
      // Token decode failed — session tracking won't run but login still succeeded
    }

    return { accessToken, user: userData };
  };

  const hasRole = (requiredRoles: string[]) =>
    user ? requiredRoles.includes(user.role) : false;

  const getPrimaryDepartment = useCallback(() => {
    if (!user) return null;
    return user.managedDepartment ?? user.department ?? null;
  }, [user]);

  return {
    token,
    user,
    isLoading,
    register,
    login,
    logout: handleLogout,
    hasRole,
    isAdmin: () => hasRole(["ADMIN"]),
    isManager: () => hasRole(["HOD", "ADMIN"]),
    refreshUserData,
    getDepartment: getPrimaryDepartment,
  };
}
