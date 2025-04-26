// src/app/(auth)/verify-email/verify-email-form.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function VerifyEmailForm() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/auth/verify-email`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

        if (!res.ok) throw new Error();
        setStatus("success");
      } catch (error) {
        setStatus("error");
        console.error("Verification error:", error);
      }
    };

    verifyEmail();
  }, [token, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-gray-900 dark:text-white">Verifying your email...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      {status === "success" ? (
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
            Email Verified!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            You can now log in to your account.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition cursor-pointer"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
            Verification Failed
          </h1>
          <p className="mt-2  text-gray-600 dark:text-gray-300">
            The link is invalid or has expired.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition cursor-pointer"
          >
            Return Home
          </button>
        </div>
      )}
    </div>
  );
}
