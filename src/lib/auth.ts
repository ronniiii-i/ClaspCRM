import { jwtDecode } from "jwt-decode";
import { NextRequest } from "next/server";
import { AuthUser } from "./modules";

export async function register(
  email: string,
  password: string,
  name: string
): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Registration failed");
  }

  return res.json();
}

// export async function login(
//   email: string,
//   password: string
// ): Promise<{
//   accessToken: string;
//   user: {
//     id: string;
//     email: string;
//     name: string;
//     role: string;
//     isVerified: boolean;
//     department: {
//       id: string;
//       name: string;
//     };
//     managedDepartment: {
//       id: string;
//       name: string;
//     };
//   };
// }> {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//     credentials: "include",
//   });

//   if (!res.ok) {
//     const error = await res.json();
//     throw new Error(error.message || "Login failed");
//   }

//   const data = await res.json();

//   // Ensure the response has the expected structure
//   const formattedResponse = {
//     accessToken: data.accessToken,
//     user: {
//       id: data.user.id,
//       email: data.user.email,
//       name: data.user.name,
//       role: data.user.role,
//       isVerified: data.user.isVerified,
//       department: data.user.department || null,
//       managedDepartment: data.user.managedDepartment || null,
//     },
//   };

//   if (typeof window !== "undefined") {
//     // Storing the token in localStorage is generally preferred for modern web applications
//     // over using cookies directly, as it provides more flexibility and avoids some of the
//     // security concerns associated with cookies (like CSRF).  We'll ONLY use localStorage.
//     localStorage.setItem("token", formattedResponse.accessToken);
//     localStorage.setItem("auth_user", JSON.stringify(formattedResponse.user));
//     console.log("LocalStorage token:", localStorage.getItem("token"));
//     try {
//       console.log("Decoded token:", jwtDecode(formattedResponse.accessToken));
//     } catch (error) {
//       console.error("Error decoding token:", error);
//       // Consider throwing the error or handling it appropriately, depending on your application's needs.
//     }
//   }

//   return formattedResponse;
// }

export async function login(
  email: string,
  password: string
): Promise<{
  accessToken: string; // The token will be returned in the body AND set as httpOnly cookie
  user: AuthUser; // Use the new AuthUser type
}> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include", // Important: this tells fetch to send/receive cookies
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  const data = await res.json();

  // The backend now sends accessibleModules in the user object
  const formattedResponse = {
    accessToken: data.accessToken,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      isVerified: data.user.isVerified,
      department: data.user.department || null,
      managedDepartment: data.user.managedDepartment || null,
      accessibleModules: data.user.accessibleModules || [], // Ensure this is set
    },
  };

  if (typeof window !== "undefined") {
    // Store token in localStorage for client-side JavaScript access (e.g., for Authorization header)
    // The httpOnly cookie is handled by the browser automatically for most requests.
    localStorage.setItem("token", formattedResponse.accessToken);
    localStorage.setItem("auth_user", JSON.stringify(formattedResponse.user));

    console.log("LocalStorage token:", localStorage.getItem("token")?.substring(0, 10) + '...');
    try {
      console.log("Decoded token:", jwtDecode(formattedResponse.accessToken));
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  return formattedResponse;
}

// export function getToken(request?: NextRequest) {
//   if (request) {
//     // Server-side (middleware)
//     return request.cookies.get("token")?.value;
//   } else if (typeof document !== "undefined") {
//     // Client-side
//     return document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("token="))
//       ?.split("=")[1];
//   }
//   return null;
// }


export function getToken(request?: NextRequest) {
  if (request) {
    // Server-side (Next.js Middleware context)
    // IMPORTANT: Middleware CANNOT access localStorage. It must read cookies.
    console.log('Middleware: Attempting to get token from cookie.');
    const cookieToken = request.cookies.get("access_token")?.value;
    if (cookieToken) {
      console.log('Middleware: Token found in cookie.');
      return cookieToken;
    }
    // If you also expect an Authorization header in middleware for some reason:
    // const authHeader = request.headers.get("authorization");
    // if (authHeader && authHeader.startsWith("Bearer ")) {
    //   return authHeader.split(" ")[1];
    // }
    console.log('Middleware: No token found in cookie.');
    return null; // No token found in httpOnly cookie
  } else if (typeof window !== "undefined") {
    // Client-side (Browser context)
    // Client-side JS can access localStorage
    console.log('Client-side: Attempting to get token from localStorage.');
    const localStorageToken = localStorage.getItem("token");
    if (localStorageToken) {
        console.log('Client-side: Token found in localStorage.');
        return localStorageToken;
    }
    console.log('Client-side: No token found in localStorage.');
    return null;
  }
  return null; // Fallback
}


let refreshTimer: NodeJS.Timeout | undefined;

// export const setupTokenRefresh = (expiresIn: number) => {
//   // Clear existing timer if any
//   if (refreshTimer) clearTimeout(refreshTimer);

//   // Set to refresh 10 minutes before expiration (increased for safety)
//   const refreshTime = (expiresIn - 600) * 1000;

//   refreshTimer = setTimeout(async () => {
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${getToken()}`, // Use the getToken() function
//         },
//       });

//       if (res.ok) {
//         const { token } = await res.json();

//         // Update token storage
//         if (typeof window !== "undefined") {
//           localStorage.setItem("token", token);
//         }

//         // Reset both timers with new token
//         setupTokenRefresh(3600); // Reset refresh timer.  Assume 1 hour refresh time.
//         resetInactivityTimer(); // Reset activity timer
//         console.log("LocalStorage token:", localStorage.getItem("token"));
//       } else {
//         logout();
//       }
//     } catch (error) {
//       console.error("Token refresh failed:", error); // Log the error
//       logout();
//     }
//   }, refreshTime);
// };

export const setupTokenRefresh = (expiresInSeconds: number) => {
  if (refreshTimer) clearTimeout(refreshTimer);

  // Set to refresh 10 minutes (600 seconds) before expiration
  // Ensure expiresInSeconds is realistic (e.g., from decoded JWT or backend response)
  const refreshTimeMs = Math.max(0, (expiresInSeconds - 600) * 1000); // Ensure it's not negative

  console.log(`Setting token refresh in ${refreshTimeMs / 1000} seconds`);

  refreshTimer = setTimeout(async () => {
    try {
      const currentToken = getToken();
      if (!currentToken) {
        console.warn("No token to refresh, logging out.");
        await logout();
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Send httpOnly cookie for refresh
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`, // Also send current token in header
        },
      });

      if (res.ok) {
        const { accessToken } = await res.json(); // New token from backend
        const decoded = jwtDecode<{ exp: number }>(accessToken);
        const newExpiresIn = decoded.exp - Math.floor(Date.now() / 1000); // Calculate new expiry

        if (typeof window !== "undefined") {
          localStorage.setItem("token", accessToken); // Update localStorage token
        }
        console.log("Token refreshed successfully.");
        setupTokenRefresh(newExpiresIn); // Reset refresh timer with new expiry
        resetInactivityTimer(); // Reset activity timer
      } else {
        console.error("Token refresh failed on API call:", res.status, res.statusText);
        await logout(); // Logout if refresh fails
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logout();
    }
  }, refreshTimeMs);
};

let inactivityTimer: ReturnType<typeof setTimeout> | undefined;

export const resetInactivityTimer = () => {
  if (inactivityTimer) clearTimeout(inactivityTimer);

  // console.log("Resetting inactivity timer...");
  inactivityTimer = setTimeout(() => {
    console.log("Inactivity timer expired, logging out.");
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login?reason=inactivity";
    }
  }, 1800000); // 30 minutes (1800000 ms)
};

// Call this when user logs in
export function initializeSessionTracking() {
  const handleActivity = () => {
    triggerActivity();
    resetInactivityTimer();
  };

  const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

  if (typeof window !== "undefined") {
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });
    resetInactivityTimer(); // Initialize timer
  }

  return () => {
    if (typeof window !== "undefined") {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    }
  };
}

let activityCallbacks: (() => void)[] = [];

export function onActivity(callback: () => void) {
  activityCallbacks.push(callback);
  return () => {
    activityCallbacks = activityCallbacks.filter((cb) => cb !== callback);
  };
}

export function triggerActivity() {
  activityCallbacks.forEach((cb) => cb());
}

// export async function logout() {
//   try {
//     // First call the backend logout endpoint
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/logout`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${getToken()}`, // Use getToken()
//       },
//       credentials: "include",
//     });

//     if (!res.ok) {
//       throw new Error("Logout failed");
//     }

//     // Then clear client-side storage
//     if (typeof window !== "undefined") {
//       // Clear timer
//       if (inactivityTimer) clearTimeout(inactivityTimer);
//       if (refreshTimer) clearTimeout(refreshTimer);

//       localStorage.removeItem("token");
//       localStorage.removeItem("auth_user");
//       window.location.href = "/login";
//     }

//     return { success: true };
//   } catch (error) {
//     console.error("Logout error:", error);
//     if (typeof window !== "undefined") {
//       localStorage.removeItem("token");
//       localStorage.removeItem("auth_user");
//     }
//     throw error; // Re-throw the error so the caller can handle it
//   }
// }

// Temporary test in your frontend


export async function logout() {
  try {
    const currentToken = getToken(); // Get token for backend logout call
    if (!currentToken) {
        console.log("No token found for backend logout. Proceeding with client-side cleanup.");
        // If no token, just do client-side cleanup and redirect.
    } else {
        // Call the backend logout endpoint to clear httpOnly cookie and blacklist token
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${currentToken}`, // Send token for backend identification
            },
            credentials: "include", // Ensure cookie is sent for logout
        });

        if (!res.ok) {
            // Log the error but proceed with client-side cleanup regardless
            const errorText = await res.text();
            console.error("Backend logout failed:", res.status, errorText);
        }
    }
  } catch (error) {
    console.error("Error during backend logout attempt:", error);
  } finally {
    // Always clear client-side storage and timers
    if (typeof window !== "undefined") {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (refreshTimer) clearTimeout(refreshTimer);

      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login"; // Full page redirect
    }
  }
}


export async function testTokenRefresh() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`, // Use getToken()
    },
  });
  console.log("Refresh response:", await res.json());
}
