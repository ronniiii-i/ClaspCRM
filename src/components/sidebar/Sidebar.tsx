// src/components/sidebar/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { getIconComponent } from "@/lib/modules";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A sidebar component that displays navigation and user information.
 *
 * @remarks
 *
 * This component is responsible for rendering the sidebar that appears on the left side of the
 * application. It fetches the user's data and permissions, and based on the user's role, it
 * renders the navigation links. It also displays the user's name and role.
 *
 * @returns A React component that renders the sidebar.
 */
export default function Sidebar() {
  const { user, isLoading: authLoading } = useAuth();
  const { modules, loading: permissionsLoading, error: permissionsError } = usePermissions();

  if (!user) return null;

  if (authLoading || permissionsLoading) {
    return <div>Loading user and permissions...</div>;
  }

  // if (permissionsError) {
  //   return <div>Error loading permissions: {permissionsError.message}</div>;
  // }

  return (
    <aside className="w-64 flex-col border-r bg-background flex h-full justify-between">
      {/* Logo/Header */}
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://picsum.photos/seed/logo/200/200"
            className="rounded-full"
            alt="Logo"
            width={32}
            height={32}
          />
          <span className="text-lg font-semibold">ClaspCRM</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto py-2">
        <ul className="space-y-1 px-2">
          {permissionsError ? <div>Error loading permissions: {permissionsError.message}</div> : (permissionsLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <li key={`skeleton-${i}`}>
                  <Skeleton className="h-10 w-full" />
                </li>
              ))
            : modules.map((module) => {
                const Icon = getIconComponent(module.icon);
                return (
                  <li key={module.id}>
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start gap-2"
                    >
                      <Link href={module.path}>
                        <Icon className="h-4 w-4" />
                        {module.name}
                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                      </Link>
                    </Button>
                  </li>
                );
              }))}
        </ul>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t">
        {user && (
          <div className="flex items-center gap-2">
            <Image
              src={user.avatar || "https://picsum.photos/seed/user/200/200"}
              alt="User"
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {user.role === "ADMIN"
                  ? "Administrator"
                  : `${user.department?.name} • ${user.role}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
