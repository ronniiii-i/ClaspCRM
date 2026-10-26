"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TenantForgotPasswordPage() {
  const params = useParams();
  const tenant = params?.tenant as string | undefined;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API || "http://localhost:3030";
      await fetch(`${apiBase}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Tenant-Slug": tenant || "" },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      // ignore
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border text-center">
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight">Check your email</CardTitle>
            <CardDescription>If an account exists, we sent a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={`/${tenant}/login`}>Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl tracking-tight">Reset password</CardTitle>
          <CardDescription>We&apos;ll send a reset link to your email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending..." : "Send reset link"}
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
