"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TenantLoginPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params?.tenant as string | undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, tenantSlug: tenant }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data?.user?.role?.isTenantAdmin && data?.user?.tenantStatus === "PAST_DUE") {
        router.push(`/${tenant}/settings/billing`);
        return;
      }
      if (data?.user?.tenantStatus === "PAST_DUE" || data?.user?.tenantStatus === "SUSPENDED") {
        router.push(`/${tenant}/account-locked`);
        return;
      }
      router.push(`/${tenant}/dashboard`);
    } catch (err) {
      setError("Invalid credentials");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl tracking-tight">Sign in to {tenant}</CardTitle>
          <CardDescription>Enter your credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Link href={`/${tenant}/forgot-password`} className="underline underline-offset-4 hover:text-foreground">
                Forgot password?
              </Link>
              <Link href="/find-workspace" className="underline underline-offset-4 hover:text-foreground">
                Find a different workspace
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
