"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-6">
          <div className="text-sm text-muted-foreground">{user?.tenantName || ""}</div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="text-sm text-muted-foreground">{user?.name}</div>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Sign out
            </Button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
