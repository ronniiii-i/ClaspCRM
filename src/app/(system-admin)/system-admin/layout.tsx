import type { ReactNode } from "react";

export default function SystemAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
