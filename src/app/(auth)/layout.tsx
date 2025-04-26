// src/app/(auth)/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { defaultMetadata } from "@/lib/seo";
import PublicNavbar from "@/components/navbar/PublicNavbar";
import Footer from "@/components/Footer";


export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Sign In | ClaspCRM by Roni Egbu",
  description: "Sign in to manage your ClaspCRM account, built by Roni Egbu.",
};
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeProvider>
        <PublicNavbar />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
        <Footer />
      </ThemeProvider>
    </>
  );
}