"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthGatewayPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const protocol = process.env.NEXT_PUBLIC_ROOT_PROTOCOL || "http";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const trimmed = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!trimmed) {
      setError("We couldn't find that workspace.");
      setLoading(false);
      return;
    }

    try {
      const apiBase = process.env.NEXT_PUBLIC_API || "http://localhost:3030";
      const response = await fetch(`${apiBase}/public/workspaces/${trimmed}`);
      if (!response.ok) {
        setError("We couldn't find that workspace.");
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (!data?.success || !data?.workspace?.slug) {
        setError("We couldn't find that workspace.");
        setLoading(false);
        return;
      }
      localStorage.setItem("clasp_last_workspace", data.workspace.slug);
      window.location.href = `${protocol}://${data.workspace.slug}.${rootDomain}/login`;
    } catch {
      setError("We couldn't find that workspace.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl tracking-tight">Find your workspace</CardTitle>
          <CardDescription>Enter your workspace URL to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="workspace">Workspace URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="workspace"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="acme"
                  autoComplete="off"
                  required
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.{rootDomain}</span>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Checking..." : "Continue"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/create-workspace" className="underline underline-offset-4 hover:text-foreground">
                Create a workspace
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
