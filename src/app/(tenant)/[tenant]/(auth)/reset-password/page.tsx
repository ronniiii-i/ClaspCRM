"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant = params?.tenant as string | undefined;
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setStatus("submitting");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API || "http://localhost:3030";
      const response = await fetch(`${apiBase}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Tenant-Slug": tenant || "" },
        body: JSON.stringify({ token, password }),
      });
      if (!response.ok) {
        throw new Error("Failed to reset");
      }
      setStatus("success");
    } catch {
      setError("Invalid or expired reset link");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border text-center">
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight">Password reset</CardTitle>
            <CardDescription>Your password has been updated.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/${tenant}/login`)}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl tracking-tight">Set a new password</CardTitle>
          <CardDescription>Choose a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Resetting..." : "Reset password"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link href={`/${tenant}/login`} className="underline underline-offset-4 hover:text-foreground">
                Back to sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
