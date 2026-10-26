import { PublicNavbar } from "@/components/marketing/PublicNavbar";
import { PublicFooter } from "@/components/marketing/PublicFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
