import { jwtDecode } from "jwt-decode";
import { NextRequest } from "next/server";
import { AuthUser } from "./modules";

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<{ success: boolean; message: string }> {
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
  password: string,
): Promise<{ accessToken: string; user: AuthUser }> {
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

  const formattedResponse = {
    accessToken: data.accessToken,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      roleEnhanced: data.user.roleEnhanced ?? false,
      isVerified: data.user.isVerified,
      tenantId: data.user.tenantId,
      department: data.user.department || null,
      managedDepartment: data.user.managedDepartment || null,
      accessibleModules: data.user.accessibleModules || [],
    },
  };

  if (typeof window !== "undefined") {
    localStorage.setItem("token", formattedResponse.accessToken);
    localStorage.setItem("auth_user", JSON.stringify(formattedResponse.user));
  }

  return formattedResponse;
}

export function getToken(request?: NextRequest): string | null {
  if (request) {
    return request.cookies.get("access_token")?.value ?? null;
  }

  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }

  return null;
}

// ─── Token Refresh ────────────────────────────────────────────────────────────

let refreshTimer: NodeJS.Timeout | undefined;

export const setupTokenRefresh = (expiresInSeconds: number) => {
  if (refreshTimer) clearTimeout(refreshTimer);

  // Refresh 10 minutes before expiry, but not if already within 10 minutes
  const refreshDelayMs = Math.max(0, (expiresInSeconds - 600) * 1000);

  refreshTimer = setTimeout(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      await logout();
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (res.ok) {
        const { accessToken } = await res.json();
        const decoded = jwtDecode<{ exp: number }>(accessToken);
        const newExpiresIn = decoded.exp - Math.floor(Date.now() / 1000);

        if (typeof window !== "undefined") {
          localStorage.setItem("token", accessToken);
        }

        setupTokenRefresh(newExpiresIn);
        resetInactivityTimer();
      } else {
        await logout();
      }
    } catch {
      await logout();
    }
  }, refreshDelayMs);
};

// ─── Inactivity Tracking ──────────────────────────────────────────────────────

let inactivityTimer: NodeJS.Timeout | undefined;

export const resetInactivityTimer = () => {
  if (inactivityTimer) clearTimeout(inactivityTimer);

  // Auto-logout after 30 minutes of inactivity
  inactivityTimer = setTimeout(() => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login?reason=inactivity";
    }
  }, 1_800_000);
};

export function initializeSessionTracking(): () => void {
  const handleActivity = () => resetInactivityTimer();
  const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

  if (typeof window !== "undefined") {
    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetInactivityTimer();
  }

  return () => {
    if (typeof window !== "undefined") {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
    }
  };
}

let activityCallbacks: (() => void)[] = [];

export function onActivity(callback: () => void): () => void {
  activityCallbacks.push(callback);
  return () => {
    activityCallbacks = activityCallbacks.filter((cb) => cb !== callback);
  };
}

export function triggerActivity() {
  activityCallbacks.forEach((cb) => cb());
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Swallow network errors — client-side cleanup must still happen
  } finally {
    if (typeof window !== "undefined") {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (refreshTimer) clearTimeout(refreshTimer);

      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");

      document.cookie =
        "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax;";

      window.location.href = "/login";
    }
  }
}
