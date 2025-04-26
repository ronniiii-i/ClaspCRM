// src/app/(auth)/verify-email/page.tsx
"use client";

import { Suspense } from "react";
import { VerifyEmailForm } from "./verify-email-form";
import { Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[90svh] px-6 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
