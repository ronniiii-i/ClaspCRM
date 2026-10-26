import type { Metadata } from "next";
import { defaultMetadata } from "@/lib/seo";
import PublicNavbar from "@/components/navbar/PublicNavbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  ...defaultMetadata,
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNavbar />
      <main className="min-h-screen bg-background text-foreground">
        {children}
      </main>
      <Footer />
    </>
  );
}
