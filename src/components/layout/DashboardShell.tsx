"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-6">
          <div className="text-sm text-muted-foreground">{user?.tenant?.name || ""}</div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="text-sm text-muted-foreground">{user?.name}</div>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
