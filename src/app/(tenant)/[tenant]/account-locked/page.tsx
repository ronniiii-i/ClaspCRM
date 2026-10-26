"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountLockedPage() {
  const params = useParams();
  const tenant = params?.tenant as string | undefined;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border text-center">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Workspace access restricted</CardTitle>
          <CardDescription>Your workspace is currently past due or suspended.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Standard users cannot access the workspace until billing is resolved. If you are a workspace admin, you can manage billing from the settings page.
          </p>
          <div className="flex flex-col gap-2">
            {tenant ? (
              <Button asChild>
                <Link href={`/${tenant}/settings/billing`}>Manage billing</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/login">Find a different workspace</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
