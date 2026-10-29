"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutDashboard, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 content rendered *inside* the dashboard shell, so a signed-in user keeps
 * their navigation and session while being told the page is missing.
 */
export function DashboardNotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-muted p-4">
        <SearchX className="h-10 w-10 text-muted-foreground" />
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl font-bold">This page is not here</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you tried to open does not exist or you may not have access to
        it. Your session is still active.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back
        </Button>
        <Button asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
