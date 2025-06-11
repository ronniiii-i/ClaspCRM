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
  setupTokenRefresh, // Keep setupTokenRefresh

} from "@/lib/auth"; 

import { AuthUser } from "@/lib/modules"
import { jwtDecode } from "jwt-decode";

// interface Department {
//   id: string;
//   name: string;
// }

// interface User {
//   id: string;
//   email: string;
//   name: string;
//   role: string;
//   avatar?: string;
//   isVerified: boolean;
//   department: Department | null;
//   managedDepartment: Department | null;
// }

// export function useAuth() {
//   const [token, setToken] = useState<string | null>(null);
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [initialized, setInitialized] = useState(false);
//   const router = useRouter();

//   const clearAuthCache = useCallback(() => {
//     if (typeof window !== "undefined") {
//       localStorage.removeItem("auth_user");
//     }
//   }, []);

//   const refreshUserData = async () => {
//     if (!token) return;
//     try {
//       const userData = await verifyToken(token);
//       setUser(userData);
//       if (typeof window !== "undefined") {
//         localStorage.setItem("auth_user", JSON.stringify(userData));
//       }
//       return userData;
//     } catch (error) {
//       handleLogout();
//       throw error;
//     }
//   };

//   const handleLogout = useCallback(async () => {
//     try {
//       await logoutAPI();
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       // Ensure client-side cleanup happens regardless of backend success
//       setToken(null);
//       setUser(null);
//       clearAuthCache();
//       router.push("/login");
//     }
//   }, [clearAuthCache, router]);

//   const getPrimaryDepartment = (): Department | null => {
//     if (!user) return null;

//     // Managers should see their managed department
//     if (user.managedDepartment) {
//       return user.managedDepartment;
//     }

//     // Regular users see their first department
//     if (user.department) {
//       return user.department;
//     }

//     return null;
//   };

//   const verifyToken = useCallback(
//     async (token: string): Promise<User> => {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/verify`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) {
//         clearAuthCache();
//         throw new Error("Invalid token");
//       }

//       const data = await res.json();
//       return {
//         ...data.user,
//         department: data.user.department || "",
//         managedDepartment: data.user.managedDepartment || "",
//       };
//     },
//     [clearAuthCache]
//   );

//   useEffect(() => {
//     if (initialized) return;

//     const initializeAuth = async () => {
//       const token = getToken();
//       setToken(token ?? null);

//       if (token) {
//         try {
//           const cachedUser =
//             typeof window !== "undefined"
//               ? localStorage.getItem("auth_user")
//               : null;

//           if (cachedUser) {
//             setUser(JSON.parse(cachedUser));
//           } else {
//             const userData = await verifyToken(token);
//             setUser(userData);
//             if (typeof window !== "undefined") {
//               localStorage.setItem("auth_user", JSON.stringify(userData));
//             }
//           }
//         } catch (error) {
//           console.error("Token verification failed:", error);
//           handleLogout();
//         }
//       }
//       setIsLoading(false);
//       setInitialized(true);
//     };

//     initializeAuth();
//   }, [initialized, handleLogout, verifyToken]);

//   const register = async (email: string, password: string, name: string) => {
//     try {
//       const response = await registerAPI(email, password, name);
//       if (!response.success) throw new Error(response.message);

//       return {
//         success: true,
//         message:
//           "Registration successful! Please check your email for verification.",
//       };
//     } catch (error) {
//       throw error instanceof Error ? error : new Error("Registration failed");
//     }
//   };

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await loginAPI(email, password);
//       // console.log("Login API response:", response);

//       if (!response.accessToken || !response.user) {
//         throw new Error("Login failed: Invalid response from server");
//       }

//       const { accessToken, user } = response;

//       if (!user.isVerified) {
//         throw new Error("Please verify your email before logging in");
//       }

//       setToken(accessToken);
//       setUser({
//         ...user,
//         name: user.name || "",
//         department: Array.isArray(user.department)
//           ? null
//           : user.department || null,
//         managedDepartment: Array.isArray(user.managedDepartment)
//           ? null
//           : user.managedDepartment || null,
//       });

//       if (typeof window !== "undefined") {
//         localStorage.setItem(
//           "auth_user",
//           JSON.stringify({
//             ...user,
//             department: user.department || "",
//             managedDepartment: user.managedDepartment || "",
//           })
//         );
//       }

//       // Return the response and let the component handle redirection
//       return { accessToken, user };
//     } catch (error) {
//       handleLogout();
//       throw error;
//     }
//   };

//   const logout = () => {
//     handleLogout();
//   };

//   const hasRole = (requiredRoles: string[]) => {
//     return user ? requiredRoles.includes(user.role) : false;
//   };

//   return {
//     token,
//     user,
//     isLoading,
//     register,
//     login,
//     logout,
//     initializeSessionTracking,
//     hasRole,
//     isAdmin: () => hasRole(["ADMIN"]),
//     isManager: () => hasRole(["MANAGER", "ADMIN"]),
//     refreshUserData,
//     clearAuthCache,
//     getDepartment: getPrimaryDepartment,
//     // testTokenRefresh,
//   };
// }

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
    } catch (error) {
      console.error("Error during logout:", error);
      clearAuthData();
      router.push("/login");
    } finally {
      setToken(null);
      setUser(null);
    }
  }, [clearAuthData, router]);


  // Verify token and fetch user data (including modules) from backend /auth/verify endpoint
  const verifyToken = useCallback(
    async (token: string): Promise<AuthUser> => {
      console.log('useAuth: Verifying token with backend.');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include", // Essential for sending the httpOnly cookie back
      });

      if (!res.ok) {
        console.error('useAuth: Token verification failed on backend. Status:', res.status);
        clearAuthData();
        throw new Error("Invalid token or session expired");
      }

      const data = await res.json();
      console.log('useAuth: Token verification successful, received user data:', data.user);
      return data.user as AuthUser;
    },
    [clearAuthData]
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
            console.log('useAuth: Initialized from cached user data.');
          } else {
            // If no cached user, verify token with backend to get fresh user data
            userData = await verifyToken(storedToken);
            setUser(userData);
            if (typeof window !== "undefined") {
              localStorage.setItem("auth_user", JSON.stringify(userData));
            }
            console.log('useAuth: Initialized from backend token verification.');
          }
          try {
            const decoded = jwtDecode<{ exp: number }>(storedToken);
            const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
            setupTokenRefresh(expiresIn);
            initializeSessionTracking();
            console.log(`useAuth: Token expires in ${expiresIn} seconds. Session tracking initialized.`);
          } catch (jwtError) {
            console.error("useAuth: Error decoding JWT for refresh setup:", jwtError);
            handleLogout();
          }

        } catch (error) {
          console.error("useAuth: Initial authentication failed:", error);
          handleLogout();
        }
      }
      setIsLoading(false);
      setInitialized(true);
      console.log('useAuth: Initialization complete.');
    };

    initializeAuth();

    return () => {
        // Any cleanup from initializeSessionTracking needs to be handled here
        // (the function returns a cleanup callback)
    };
  }, [initialized, handleLogout, verifyToken]);


  const refreshUserData = useCallback(async () => {
    if (!token) {
      console.warn("Cannot refresh user data: No token available.");
      return;
    }
    setIsLoading(true);
    try {
      const freshUserData = await verifyToken(token);
      setUser(freshUserData);
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(freshUserData));
      }
      console.log('useAuth: User data refreshed from backend.');
      return freshUserData;
    } catch (error) {
      console.error("useAuth: Failed to refresh user data:", error);
      handleLogout();
      throw error;
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
    try {
      const response = await loginAPI(email, password);
      console.log("useAuth: Login API response:", response);

      if (!response.accessToken || !response.user) {
        throw new Error("Login failed: Invalid response from server");
      }

      const { accessToken, user } = response;

      if (!user.isVerified) {
        throw new Error("Please verify your email before logging in");
      }

      setToken(accessToken);
      setUser(user);

      try {
        const decoded = jwtDecode<{ exp: number }>(accessToken);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        setupTokenRefresh(expiresIn);
        initializeSessionTracking();
        console.log(`useAuth: Login successful. Token expires in ${expiresIn} seconds. Session tracking initialized.`);
      } catch (jwtError) {
        console.error("useAuth: Error decoding JWT for refresh setup after login:", jwtError);
        handleLogout();
      }

      return { accessToken, user };
    } catch (error) {
      console.error("useAuth: Login failed:", error);
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

  const getPrimaryDepartment = useCallback(() => {
    if (!user) return null;

    // Managers should see their managed department
    if (user.managedDepartment) {
      return user.managedDepartment;
    }

    // Regular users see their department
    if (user.department) {
      return user.department;
    }
    return null;
  }, [user]);


  return {
    token,
    user,
    isLoading,
    register,
    login,
    logout,
    hasRole,
    isAdmin: () => hasRole(["ADMIN"]),
    isManager: () => hasRole(["HOD", "ADMIN"]), // Assuming HOD is also a manager for role-based checks
    refreshUserData,
    getDepartment: getPrimaryDepartment,
  };
}