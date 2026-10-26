"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "General", href: "/settings" },
  { name: "Departments", href: "/settings/departments" },
  { name: "Roles & Permissions", href: "/settings/roles" },
  { name: "Billing", href: "/settings/billing" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isTenantAdmin = user?.role?.isTenantAdmin;
  const visibleTabs = isTenantAdmin ? tabs : tabs.slice(0, 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Workspace configuration.</p>
      </div>
      <nav className="flex flex-wrap gap-2 border-b border-border">
        {visibleTabs.map((tab) => {
          const active = pathname === tab.href || pathname?.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                active && "border-b border-foreground text-foreground"
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
      <div>{children}</div>
    </div>
  );
}
