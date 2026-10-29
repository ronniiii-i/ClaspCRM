"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InvitationPreview {
  tenantName?: string;
  invitedByName?: string;
  roleName?: string;
}

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params?.tenant as string | undefined;
  const token = params?.token as string | undefined;
  const [invite, setInvite] = useState<InvitationPreview | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "submitting" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API || "http://localhost:3030";
        const response = await fetch(`${apiBase}/public/invitations/${token}`, {
          headers: { "X-Tenant-Slug": tenant || "" },
        });
        if (!response.ok) {
          setStatus("error");
          return;
        }
        const data = await response.json();
        setInvite(data.invitation);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }
    if (token && tenant) {
      load();
    }
  }, [token, tenant]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("submitting");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API || "http://localhost:3030";
      const response = await fetch(`${apiBase}/public/invitations/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Tenant-Slug": tenant || "" },
        body: JSON.stringify({ name, password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to accept invite");
      }
      setStatus("success");
      setTimeout(() => router.push(`/${tenant}/dashboard`), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invite");
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading invitation...</p>
      </div>
    );
  }

  if (status === "error" || !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border text-center">
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight">Invitation invalid</CardTitle>
            <CardDescription>This invitation may be expired or revoked.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/${tenant}/login`)}>Go to sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border text-center">
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight">Welcome to {invite.tenantName || tenant}</CardTitle>
            <CardDescription>Account created successfully.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl tracking-tight">Accept invitation</CardTitle>
          <CardDescription>
            {invite.invitedByName ? `${invite.invitedByName} invited you` : "You've been invited"} to {invite.tenantName || tenant} as {invite.roleName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Accepting..." : "Accept invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
