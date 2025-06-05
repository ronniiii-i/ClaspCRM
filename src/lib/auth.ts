import { jwtDecode } from "jwt-decode";
import { NextRequest } from "next/server";

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

export async function login(
  email: string,
  password: string
): Promise<{
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
    department: {
      id: string;
      name: string;
    };
    managedDepartment: {
      id: string;
      name: string;
    };
  };
}> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  const data = await res.json();

  // Ensure the response has the expected structure
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
    },
  };

  if (typeof window !== "undefined") {
    // Storing the token in localStorage is generally preferred for modern web applications
    // over using cookies directly, as it provides more flexibility and avoids some of the
    // security concerns associated with cookies (like CSRF).  We'll ONLY use localStorage.
    localStorage.setItem("token", formattedResponse.accessToken);
    localStorage.setItem("auth_user", JSON.stringify(formattedResponse.user));
    console.log("LocalStorage token:", localStorage.getItem("token"));
    try {
      console.log("Decoded token:", jwtDecode(formattedResponse.accessToken));
    } catch (error) {
      console.error("Error decoding token:", error);
      // Consider throwing the error or handling it appropriately, depending on your application's needs.
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


// Improved token retrieval
export function getToken(request?: NextRequest) {
  // console.log(request?.body);
  if (request) {
    // Server-side (middleware)
    //  We should retrieve the token from request headers, not cookies or localStorage.
    //  The token is typically sent in the Authorization header:
    // console.log(request);

    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.split(" ")[1]; // Extract the token part
    }
    return null; // Or handle the case where the token is not found
  } else if (typeof document !== "undefined") {
    // Client-side
    return localStorage.getItem("token");
  }

  console.log('Retrieved Token:', token); // Debug logging
  return token;
}

let refreshTimer: NodeJS.Timeout;

export const setupTokenRefresh = (expiresIn: number) => {
  // Clear existing timer if any
  if (refreshTimer) clearTimeout(refreshTimer);

  // Set to refresh 10 minutes before expiration (increased for safety)
  const refreshTime = (expiresIn - 600) * 1000;

  refreshTimer = setTimeout(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`, // Use the getToken() function
        },
      });

      if (res.ok) {
        const { token } = await res.json();

        // Update token storage
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
        }

        // Reset both timers with new token
        setupTokenRefresh(3600); // Reset refresh timer.  Assume 1 hour refresh time.
        resetInactivityTimer(); // Reset activity timer
        console.log("LocalStorage token:", localStorage.getItem("token"));
      } else {
        logout();
      }
    } catch (error) {
      console.error("Token refresh failed:", error); // Log the error
      logout();
    }
  }, refreshTime);
};

let inactivityTimer: ReturnType<typeof setTimeout>;

const resetInactivityTimer = () => {
  // Clear existing timer
  if (inactivityTimer) clearTimeout(inactivityTimer);

  // Set new timer (1 hour = 3600000 ms)
  inactivityTimer = setTimeout(() => {
    logout();
    //  Reloading and redirecting is not ideal.  It's better to handle this
    //  more gracefully in the UI (e.g., show a modal, then redirect).
    if (typeof window !== "undefined") {
      window.location.href = "/login?reason=inactivity";
    }
  }, 1800000); // 1 hour in milliseconds
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

export async function logout() {
  try {
    // First call the backend logout endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`, // Use getToken()
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Logout failed");
    }

    // Then clear client-side storage
    if (typeof window !== "undefined") {
      // Clear timer
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (refreshTimer) clearTimeout(refreshTimer);

      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
    }
    throw error; // Re-throw the error so the caller can handle it
  }
}

// Temporary test in your frontend
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
