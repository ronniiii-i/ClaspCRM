// src/app/(auth)/layout.tsx
import { ThemeProvider } from "@/components/ThemeProvider";
import PublicNavbar from "@/components/navbar/PublicNavbar";
import Footer from "@/components/Footer";

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