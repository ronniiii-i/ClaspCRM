"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SystemAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface SystemAdminState {
  admin: SystemAdmin | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (admin: SystemAdmin, token: string) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useSystemAdminStore = create<SystemAdminState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isLoading: false,
      setAuth: (admin, token) => set({ admin, token }),
      logout: () => {
        set({ admin: null, token: null });
        fetch("/api/system-admin/logout", { method: "POST" }).catch(() => {});
      },
      initialize: async () => {
        try {
          set({ isLoading: true });
          const res = await fetch("/api/system-admin/verify", { credentials: "include" });
          if (res.ok) {
            const data = await res.json();
            set({ admin: data.admin || data, token: get().token || data.accessToken || data.token || null });
          } else {
            set({ admin: null, token: null });
          }
        } catch {
          set({ admin: null, token: null });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "clasp-system-admin-v3",
      partialize: (state) => ({ admin: state.admin, token: state.token }),
    }
  )
);
