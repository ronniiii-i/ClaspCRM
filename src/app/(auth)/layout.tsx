import type { Metadata } from "next";
import { defaultMetadata } from "@/lib/seo";
import { PublicNavbar } from "@/components/navbar/PublicNavbar";
import { PublicFooter } from "@/components/footer/PublicFooter";

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Sign In | ClaspCRM",
  description: "Sign into your ClaspCRM account.",
};
export default function AuthLayout({
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
      <PublicFooter />
    </>
  );
}
