"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

function getTenantPath(pathname: string, tenant: string) {
  const prefix = `/${tenant}`;
  if (pathname.startsWith(prefix)) {
    return pathname.slice(prefix.length) || "/";
  }
  return pathname;
}

export function Sidebar() {
  const params = useParams();
  const pathname = usePathname();
  const tenant = params?.tenant as string | undefined;
  const { user } = useAuth();
  const activeRef = useRef<HTMLAnchorElement>(null);
  const isTenantAdmin = user?.role?.isTenantAdmin;
  const tenantPath = tenant ? getTenantPath(pathname || "", tenant) : pathname || "/";

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [tenantPath]);

  const adminNav = [
    { name: "Global Metrics", href: "/dashboard" },
    { name: "Department Overviews", href: "/departments" },
    { name: "User Management", href: "/user-management" },
    { name: "Settings", href: "/settings" },
  ];

  const navItems = isTenantAdmin ? adminNav : [];

  return (
    <aside className="hidden w-64 flex-col border-r border-border md:flex">
      <div className="flex h-14 items-center px-6">
        <Link href={tenant ? `/${tenant}/dashboard` : "/"} className="text-sm font-semibold tracking-tight">
          ClaspCRM
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const href = tenant ? `/${tenant}${item.href}` : item.href;
            const isActive = tenantPath === item.href || (item.href !== "/dashboard" && tenantPath.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  ref={isActive ? activeRef : undefined}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "bg-muted text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
