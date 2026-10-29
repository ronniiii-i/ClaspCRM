"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreateWorkspacePage() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  useEffect(() => {
    if (!slugEdited && workspaceName) {
      setSlug(slugify(workspaceName));
    }
  }, [workspaceName, slugEdited]);

  useEffect(() => {
    const trimmed = slug.trim();
    if (!trimmed || trimmed.length < 3) {
      setSlugAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API || "http://localhost:3030";
        const response = await fetch(`${apiBase}/public/workspaces/${trimmed}`);
        setSlugAvailable(response.status === 404);
      } catch {
        setSlugAvailable(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [slug]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("submitting");

    const payload = {
      workspaceName: workspaceName.trim(),
      slug: slug.trim().toLowerCase(),
      ownerName: ownerName.trim(),
      email: email.trim().toLowerCase(),
      password,
      acceptTerms: terms,
    };

    try {
      const apiBase = process.env.NEXT_PUBLIC_API || "http://localhost:3030";
      const response = await fetch(`${apiBase}/public/workspaces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create workspace");
      }

      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workspace");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border text-center">
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight">Check your email</CardTitle>
            <CardDescription>We sent a verification link to {email}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Verify your email to activate your workspace at {slug}.{rootDomain}.
            </p>
            <Button asChild variant="outline">
              <Link href="/login">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl tracking-tight">Create your Workspace</CardTitle>
          <CardDescription>14 days free, no credit card required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="workspaceName">Workspace name</Label>
              <Input
                id="workspaceName"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Workspace URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setSlug(slugify(event.target.value));
                  }}
                  required
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.{rootDomain}</span>
              </div>
              {slug.trim().length >= 3 && slugAvailable === false && (
                <p className="text-xs text-destructive">That slug is already taken.</p>
              )}
              {slug.trim().length >= 3 && slugAvailable === true && (
                <p className="text-xs text-muted-foreground">That slug is available.</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ownerName">Your name</Label>
                <Input id="ownerName" value={ownerName} onChange={(event) => setOwnerName(event.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={terms} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTerms(event.target.checked)} />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={status === "submitting" || !terms || slugAvailable === false} className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90">
              {status === "submitting" ? "Creating..." : "Create your Workspace"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
                Find your workspace
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
