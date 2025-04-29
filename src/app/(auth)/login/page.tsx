// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, token, isLoading, initializeSessionTracking } = useAuth();
  const router = useRouter();

  // Handle redirect when authenticated
  useEffect(() => {
    if (token && !isLoading) {
      router.refresh();
      router.push("/dashboard");
      // window.location.href = "/dashboard"; // Fallback for older browsers
    }
  }, [token, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      initializeSessionTracking();
      console.log(initializeSessionTracking);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[90svh] px-6 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Login
        </h1>
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            required
            autoComplete="username"
          />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <div className="text-right">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-blue-500 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            required
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Sign in"
          )}
        </button>
        {/* don't have an account? sign up. this should lead to the path /register */}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
