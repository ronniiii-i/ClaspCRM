"use client";

import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DashboardNotFound } from "@/components/not-found/DashboardNotFound";
import { PublicNotFound } from "@/components/not-found/PublicNotFound";

/**
 * Root 404 boundary.
 *
 * Next.js renders this for unknown URLs. Signed-in users keep the dashboard
 * chrome (sidebar + navbar) so a mistyped URL does not eject them from the
 * app; visitors who are not signed in get the standalone public 404.
 */
export default function NotFound() {
  const { user, isLoading } = useAuth();

  // Decide after the session has been restored, otherwise a signed-in user
  // would briefly see the public page on every hard refresh of a bad URL.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (!user) return <PublicNotFound />;

  return (
    <DashboardShell>
      <DashboardNotFound />
    </DashboardShell>
  );
}
