import "../globals.css";
// import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { defaultMetadata } from "@/lib/seo";
import PublicNavbar from "@/components/navbar/PublicNavbar";
import Footer from "@/components/Footer";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  ...defaultMetadata,
};

export default function RootLayout({
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
