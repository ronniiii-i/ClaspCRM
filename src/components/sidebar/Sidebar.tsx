"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { getIconComponent } from "@/lib/modules";
import { Skeleton } from "@/components/ui/skeleton";
import { Module } from "@/lib/modules";

// Modules that always appear first, in this exact order, regardless of group
const PINNED_IDS = ["dashboard", "user-management"];

// Group display order (groups not listed here appear alphabetically after)
const GROUP_ORDER = [
  "General",
  "Finance",
  "Sales",
  "Customer Support",
  "Human Resources",
  "IT",
  "Operations",
  "Administration",
];

function groupModules(modules: Module[]): { group: string; items: Module[] }[] {
  // Sort pinned items first by their PINNED_IDS position, then the rest by group order + name
  const pinned = PINNED_IDS.map((id) =>
    modules.find((m) => m.id === id),
  ).filter(Boolean) as Module[];
  const rest = modules.filter((m) => !PINNED_IDS.includes(m.id));

  // Group the non-pinned modules
  const grouped: Record<string, Module[]> = {};
  for (const mod of rest) {
    const group = (mod as unknown as Record<string, string>).group ?? "Other";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(mod);
  }

  const result: { group: string; items: Module[] }[] = [];

  // Pinned always goes first under "General" heading
  if (pinned.length > 0) {
    result.push({ group: "General", items: pinned });
  }

  // Then remaining groups in defined order
  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    const ai = GROUP_ORDER.indexOf(a);
    const bi = GROUP_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  for (const group of sortedGroups) {
    if (group === "General") continue; // already handled above
    result.push({ group, items: grouped[group] });
  }

  return result;
}

export default function Sidebar() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    modules,
    loading: permissionsLoading,
    error: permissionsError,
  } = usePermissions();
  const pathname = usePathname();

  if (!user) return null;

  const grouped = groupModules(modules);
  const isLoading = authLoading || permissionsLoading;

  return (
    <aside className="w-64 flex-col border-r bg-background flex h-full justify-between">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
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
      <nav className="flex-1 overflow-y-auto py-2">
        {permissionsError ? (
          <p className="px-4 py-2 text-sm text-destructive">
            Failed to load navigation
          </p>
        ) : isLoading ? (
          <div className="space-y-1 px-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(({ group, items }) => (
              <div key={group}>
                <p className="px-4 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
                <ul className="space-y-0.5 px-2">
                  {items.map((module) => {
                    const Icon = getIconComponent(module.icon);
                    const isActive =
                      pathname === module.path ||
                      (module.path !== "/dashboard" &&
                        pathname.startsWith(module.path));

                    return (
                      <li key={module.id}>
                        <Link
                          href={module.path}
                          className={cn(
                            "flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent hover:text-accent-foreground text-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 truncate">{module.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t">
        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-md p-2 hover:bg-accent transition-colors"
        >
          <Image
            src={user.avatar || `https://picsum.photos/seed/${user.id}/200/200`}
            alt={user.name}
            width={32}
            height={32}
            className="rounded-full shrink-0 object-cover"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.role === "ADMIN"
                ? "Administrator"
                : `${user.department?.name ?? user.managedDepartment?.name} • ${user.role}`}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
