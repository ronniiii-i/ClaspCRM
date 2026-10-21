"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { getIconComponent } from "@/lib/modules";
import { Skeleton } from "@/components/ui/skeleton";
import { Module } from "@/lib/modules";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, ChevronUp, Sparkles } from "lucide-react";

// Extends the base Module type with the optional group field sent by the backend
interface ModuleWithGroup extends Module {
  group?: string;
}

// Always first, in this order, no group label
const PINNED_IDS = ["dashboard", "user-management"];
// Always pinned at the bottom above the user footer, for every role
const BOTTOM_IDS = ["notifications", "settings"];

const GROUP_ORDER = [
  "Finance",
  "Sales",
  "Customer Support",
  "Human Resources",
  "IT",
  "Operations",
  "Administration",
];

function splitModules(modules: ModuleWithGroup[], isAdmin: boolean) {
  const pinned = PINNED_IDS.map((id) =>
    modules.find((m) => m.id === id),
  ).filter((m): m is ModuleWithGroup => m !== undefined);

  const bottom = BOTTOM_IDS.map((id) =>
    modules.find((m) => m.id === id),
  ).filter((m): m is ModuleWithGroup => m !== undefined);

  const excluded = new Set([...PINNED_IDS, ...BOTTOM_IDS]);
  const rest = modules.filter((m) => !excluded.has(m.id));

  if (isAdmin) {
    const grouped: Record<string, ModuleWithGroup[]> = {};
    for (const mod of rest) {
      const group = mod.group ?? "Other";
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(mod);
    }
    const sortedGroups = Object.keys(grouped).sort((a, b) => {
      const ai = GROUP_ORDER.indexOf(a);
      const bi = GROUP_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return {
      pinned,
      sections: sortedGroups.map((g) => ({ group: g, items: grouped[g] })),
      bottom,
    };
  }

  // Non-admin: flat list, no group labels
  return {
    pinned,
    sections: rest.length ? [{ group: "", items: rest }] : [],
    bottom,
  };
}

function NavItem({
  module,
  pathname,
}: {
  module: ModuleWithGroup;
  pathname: string;
}) {
  const Icon = getIconComponent(module.icon);
  const ref = useRef<HTMLAnchorElement>(null);
  const isActive =
    pathname === module.path ||
    (module.path !== "/dashboard" && pathname.startsWith(module.path));

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isActive]);

  return (
    <li>
      <Link
        ref={ref}
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
}

export default function Sidebar() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const {
    modules,
    loading: permissionsLoading,
    error: permissionsError,
  } = usePermissions();
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN";
  const isLoading = authLoading || permissionsLoading;

  if (!user) return null;

  const { pinned, sections, bottom } = splitModules(
    modules as ModuleWithGroup[],
    isAdmin,
  );

  const avatarSrc =
    user.avatar || `https://picsum.photos/seed/${user.id}/200/200`;
  const deptLabel =
    user.role === "ADMIN"
      ? "Administrator"
      : `${user.managedDepartment?.name ?? user.department?.name ?? "No Department"} · ${user.role}`;

  return (
    <aside className="w-64 flex flex-col border-r bg-background h-full">
      {/* Logo */}
      <div className="p-4 border-b shrink-0">
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

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto py-2 min-h-0">
        {permissionsError ? (
          <p className="px-4 py-2 text-sm text-destructive">
            Failed to load navigation
          </p>
        ) : isLoading ? (
          <div className="space-y-1 px-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {/* Pinned: Dashboard + User Management (no label) */}
            {pinned.length > 0 && (
              <ul className="space-y-0.5 px-2 pb-2">
                {pinned.map((mod) => (
                  <NavItem key={mod.id} module={mod} pathname={pathname} />
                ))}
              </ul>
            )}

            {/* Department sections — labels only for admin */}
            {sections.map(({ group, items }) => (
              <div key={group || "main"}>
                {group && isAdmin && (
                  <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </p>
                )}
                <ul className="space-y-0.5 px-2">
                  {items.map((mod) => (
                    <NavItem key={mod.id} module={mod} pathname={pathname} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Notifications + Settings pinned above user footer */}
      {!isLoading && bottom.length > 0 && (
        <div className="shrink-0 border-t px-2 py-2">
          <ul className="space-y-0.5">
            {bottom.map((mod) => (
              <NavItem key={mod.id} module={mod} pathname={pathname} />
            ))}
          </ul>
        </div>
      )}

      {/* User popup menu */}
      <div className="shrink-0 border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 w-full rounded-md p-2 hover:bg-accent transition-colors text-left">
              <Image
                src={avatarSrc}
                alt={user.name}
                width={32}
                height={32}
                className="rounded-full shrink-0 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  {user.roleEnhanced && (
                    <Sparkles className="h-3 w-3 text-amber-500 shrink-0" aria-label="Role enhanced" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {deptLabel}
                  {user.roleEnhanced && " • Role+"}
                </p>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium">{user.name}</p>
                {user.roleEnhanced && (
                  <Sparkles className="h-3 w-3 text-amber-500 shrink-0" aria-label="Role enhanced" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
                {user.roleEnhanced && " • Role+"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex items-center gap-2 cursor-pointer"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
