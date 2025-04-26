// src/app/(auth)/reset-password/page.tsx
"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[90svh] px-6 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
