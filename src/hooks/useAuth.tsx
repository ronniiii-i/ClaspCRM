// src/hooks/useAuth.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  login as loginAPI,
  logout as logoutAPI,
  getToken,
  register as registerAPI,
  initializeSessionTracking,
  // testTokenRefresh,
} from "@/lib/auth";

interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
  department: Department | null;
  managedDepartment: Department | null;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const clearAuthCache = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user");
    }
  }, []);

  const refreshUserData = async () => {
    if (!token) return;
    try {
      const userData = await verifyToken(token);
      setUser(userData);
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(userData));
      }
      return userData;
    } catch (error) {
      handleLogout();
      throw error;
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      await logoutAPI(); // Now calls the backend endpoint
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Ensure client-side cleanup happens regardless of backend success
      setToken(null);
      setUser(null);
      clearAuthCache();
      router.push("/login");
    }
  }, [clearAuthCache, router]);

  const getPrimaryDepartment = (): Department | null => {
    if (!user) return null;

    // Managers should see their managed department
    if (user.managedDepartment) {
      return user.managedDepartment;
    }

    // Regular users see their first department
    if (user.department) {
      return user.department;
    }

    return null;
  };

  const verifyToken = useCallback(
    async (token: string): Promise<User> => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        clearAuthCache();
        throw new Error("Invalid token");
      }

      const data = await res.json();
      return {
        ...data.user,
        department: data.user.department || "",
        managedDepartment: data.user.managedDepartment || "",
      };
    },
    [clearAuthCache]
  );

  useEffect(() => {
    if (initialized) return;

    const initializeAuth = async () => {
      const token = getToken();
      setToken(token ?? null);

      if (token) {
        try {
          const cachedUser =
            typeof window !== "undefined"
              ? localStorage.getItem("auth_user")
              : null;

          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          } else {
            const userData = await verifyToken(token);
            setUser(userData);
            if (typeof window !== "undefined") {
              localStorage.setItem("auth_user", JSON.stringify(userData));
            }
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          handleLogout();
        }
      }
      setIsLoading(false);
      setInitialized(true);
    };

    initializeAuth();
  }, [initialized, handleLogout, verifyToken]);

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
    try {
      const response = await loginAPI(email, password);
      // console.log("Login API response:", response);

      if (!response.accessToken || !response.user) {
        throw new Error("Login failed: Invalid response from server");
      }

      const { accessToken, user } = response;

      if (!user.isVerified) {
        throw new Error("Please verify your email before logging in");
      }

      setToken(accessToken);
      setUser({
        ...user,
        name: user.name || "",
        department: Array.isArray(user.department)
          ? null
          : user.department || null,
        managedDepartment: Array.isArray(user.managedDepartment)
          ? null
          : user.managedDepartment || null,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "auth_user",
          JSON.stringify({
            ...user,
            department: user.department || "",
            managedDepartment: user.managedDepartment || "",
          })
        );
      }

      // Return the response and let the component handle redirection
      return { accessToken, user };
    } catch (error) {
      handleLogout();
      throw error;
    }
  };

  const logout = () => {
    handleLogout();
  };

  const hasRole = (requiredRoles: string[]) => {
    return user ? requiredRoles.includes(user.role) : false;
  };

  return {
    token,
    user,
    isLoading,
    register,
    login,
    logout,
    initializeSessionTracking,
    hasRole,
    isAdmin: () => hasRole(["ADMIN"]),
    isManager: () => hasRole(["MANAGER", "ADMIN"]),
    refreshUserData,
    clearAuthCache,
    getDepartment: getPrimaryDepartment,
    // testTokenRefresh,
  };
}
