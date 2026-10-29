"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AppNotFound() {
  const params = useParams();
  const tenant = params?.tenant as string | undefined;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Not found</h1>
        <p className="text-sm text-muted-foreground">This page does not exist or you do not have access.</p>
      </div>
      <Button asChild>
        <Link href={tenant ? `/${tenant}/dashboard` : "/login"}>Back to dashboard</Link>
      </Button>
    </div>
  );
}
