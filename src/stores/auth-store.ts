"use client";

import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import {
  getToken,
  initializeSessionTracking,
  login as loginAPI,
  logout as logoutAPI,
  register as registerAPI,
  setupTokenRefresh,
} from "@/lib/auth";
import type { AuthUser } from "@/lib/modules";

const CACHED_USER_KEY = "auth_user";

export interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  /** True only while the very first session restore is in flight. */
  isLoading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<{ accessToken: string; user: AuthUser }>;
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<AuthUser | undefined>;
}

/**
 * Session state is kept in a single module-level store instead of inside
 * `useAuth`. `useAuth` is used by the sidebar, the navbar, every page and
 * several hooks; when each of those owned its own copy of the state they each
 * ran their own `/auth/verify` request on first load, so opening the dashboard
 * fired five or six identical (and, against a remote database, slow) calls.
 *
 * The store also guarantees that session tracking and the token refresh timer
 * are installed exactly once per session.
 */

// Shared in-flight guards. Every caller awaits the same promise, so N mounts
// still produce a single network request.
let initializePromise: Promise<void> | null = null;
let verifyInFlight: { token: string; promise: Promise<AuthUser> } | null = null;
let stopSessionTracking: (() => void) | null = null;

function readCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
  } catch {
    // Storage can be unavailable (private mode); the session still works.
  }
}

function clearStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem(CACHED_USER_KEY);
}

async function requestVerification(token: string): Promise<AuthUser> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Invalid token or session expired");
  const data = await res.json();
  return data.user as AuthUser;
}

function verify(token: string): Promise<AuthUser> {
  if (verifyInFlight?.token === token) return verifyInFlight.promise;

  const promise = requestVerification(token).finally(() => {
    if (verifyInFlight?.promise === promise) verifyInFlight = null;
  });

  verifyInFlight = { token, promise };
  return promise;
}

function scheduleRefresh(token: string): void {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) return;
    setupTokenRefresh(decoded.exp - Math.floor(Date.now() / 1000));
  } catch {
    // A token we cannot decode cannot be refreshed; the API will 401 and the
    // user will be sent back to the login screen.
  }
}

function startSessionTracking(): void {
  if (stopSessionTracking) return;
  stopSessionTracking = initializeSessionTracking();
}

function stopTracking(): void {
  stopSessionTracking?.();
  stopSessionTracking = null;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,
  initialized: false,

  initialize: () => {
    if (get().initialized) return Promise.resolve();
    if (initializePromise) return initializePromise;

    initializePromise = (async () => {
      const storedToken = getToken();
      set({ token: storedToken, isLoading: true });

      if (!storedToken) {
        set({ user: null, isLoading: false, initialized: true });
        return;
      }

      scheduleRefresh(storedToken);
      startSessionTracking();

      // A cached profile makes navigation instant. It is refreshed by
      // `refreshUserData` and whenever the token is reissued.
      const cachedUser = readCachedUser();
      if (cachedUser) {
        set({ user: cachedUser, isLoading: false, initialized: true });
        return;
      }

      try {
        const user = await verify(storedToken);
        persistUser(user);
        set({ user, isLoading: false, initialized: true });
      } catch {
        clearStorage();
        stopTracking();
        set({
          token: null,
          user: null,
          isLoading: false,
          initialized: true,
        });
      }
    })().finally(() => {
      initializePromise = null;
    });

    return initializePromise;
  },

  login: async (email, password) => {
    const response = await loginAPI(email, password);

    if (!response.accessToken || !response.user) {
      throw new Error("Login failed: Invalid response from server");
    }
    if (!response.user.isVerified) {
      throw new Error("Please verify your email before logging in");
    }

    persistUser(response.user);
    set({
      token: response.accessToken,
      user: response.user,
      isLoading: false,
      initialized: true,
    });

    scheduleRefresh(response.accessToken);
    startSessionTracking();

    return response;
  },

  register: async (email, password, name) => {
    const response = await registerAPI(email, password, name);
    if (!response.success) throw new Error(response.message);
    return {
      success: true,
      message:
        "Registration successful! Please check your email for verification.",
    };
  },

  logout: async () => {
    stopTracking();
    set({ token: null, user: null });
    // `logoutAPI` clears storage, the cookie and redirects to /login.
    await logoutAPI();
  },

  refreshUserData: async () => {
    const { token } = get();
    if (!token) return undefined;

    try {
      const user = await verify(token);
      persistUser(user);
      set({ user });
      return user;
    } catch {
      // Background refresh failures must not log the user out; a real 401 will
      // surface on the next explicit API call.
      return undefined;
    }
  },
}));
