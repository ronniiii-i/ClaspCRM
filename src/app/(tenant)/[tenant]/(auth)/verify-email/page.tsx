"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant = params?.tenant as string | undefined;
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    async function verify() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API || "http://localhost:3030";
        const response = await fetch(`${apiBase}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Tenant-Slug": tenant || "" },
          body: JSON.stringify({ token }),
        });
        setStatus(response.ok ? "success" : "error");
      } catch {
        setStatus("error");
      }
    }
    if (token) {
      verify();
    } else {
      setStatus("error");
    }
  }, [token, tenant]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border text-center">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Email verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Your email has been verified."}
            {status === "error" && "Invalid or expired verification link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push(`/${tenant}/login`)}>Go to sign in</Button>
        </CardContent>
      </Card>
    </div>
  );
}
