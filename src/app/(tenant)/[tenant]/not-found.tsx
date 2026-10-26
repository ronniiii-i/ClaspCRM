"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function TenantNotFound() {
  const params = useParams();
  const tenant = params?.tenant as string | undefined;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">404</h1>
        <p className="text-lg text-muted-foreground">Page not found in this workspace.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {tenant ? (
          <Button asChild>
            <Link href={`/${tenant}/dashboard`}>Back to dashboard</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
