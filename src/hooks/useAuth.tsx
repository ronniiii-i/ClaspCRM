// src/hooks/useAuth.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  login as loginAPI,
  logout as logoutAPI,
  getToken,
  register as registerAPI,
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
  isVerified: boolean;
  departments: Department[];
  managedDepts: Department[];
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

  const handleLogout = useCallback(() => {
    logoutAPI();
    setToken(null);
    setUser(null);
    clearAuthCache();
    router.push("/login");
  }, [clearAuthCache, router]);

  const getPrimaryDepartment = (): Department | null => {
    if (!user) return null;

    // Managers should see their managed department
    if (user.managedDepts?.length) {
      return user.managedDepts[0];
    }

    // Regular users see their first department
    if (user.departments?.length) {
      return user.departments[0];
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
        departments: data.user.departments || [],
        managedDepts: data.user.managedDepts || [],
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
      console.log("Login API response:", response);

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
        departments: user.departments || [],
        managedDepts: user.managedDepts || [],
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "auth_user",
          JSON.stringify({
            ...user,
            departments: user.departments || [],
            managedDepts: user.managedDepts || [],
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
    hasRole,
    isAdmin: () => hasRole(["ADMIN"]),
    isManager: () => hasRole(["MANAGER", "ADMIN"]),
    refreshUserData,
    clearAuthCache,
    getDepartment: getPrimaryDepartment,
  };
}
