"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import type { Module } from "@/lib/modules";
import { initials, isTenantAdminRole, roleLabel } from "@/lib/format";
import {
  findActiveGroupKey,
  groupModules,
  isModuleActive,
  stripTenantPrefix,
} from "@/lib/workspace-navigation";
import { SidebarGroup } from "./SidebarGroup";

const COLLAPSED_GROUPS_KEY = "sidebar_collapsed_groups";

function staticModule(
  name: string,
  path: string,
  icon: string,
  order: number,
): Module {
  return {
    id: `static:${path}`,
    key: path.slice(1),
    name,
    path,
    icon,
    group: "Workspace",
    order,
    type: "DASHBOARD_VIEW",
    actions: ["VIEW"],
  };
}

const ADMIN_LINKS = [
  staticModule("Department Overviews", "/departments", "layout-dashboard", 900),
  staticModule("User Management", "/user-management", "users", 901),
  staticModule("Settings", "/settings", "settings", 902),
];

const PROFILE_LINK = staticModule("My profile", "/profile", "users", 950);

/**
 * Dynamic workspace navigation.
 *
 * Modules come from the ACL payload (with the session fallback), grouped by
 * department and sorted by `department.sortOrder` then `module.order`.
 */
export function Sidebar() {
  const params = useParams();
  const pathname = usePathname();
  const tenant = params?.tenant as string | undefined;
  const { user } = useAuth();
  const { modules } = usePermissions();
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  const tenantPath = stripTenantPrefix(pathname || "/", tenant);
  const isTenantAdmin = isTenantAdminRole(
    user?.role as unknown as
      | { isTenantAdmin?: boolean; slug?: string }
      | string,
  );

  const navModules = useMemo(() => {
    const list = [...(modules ?? [])];
    const seen = new Set(list.map((item) => item.path));

    const extras = isTenantAdmin ? ADMIN_LINKS : [];
    for (const extra of extras) {
      if (!seen.has(extra.path)) {
        list.push(extra);
        seen.add(extra.path);
      }
    }

    if (!seen.has(PROFILE_LINK.path)) {
      list.push(PROFILE_LINK);
    }

    return list;
  }, [modules, isTenantAdmin]);

  const groups = useMemo(() => groupModules(navModules), [navModules]);
  const activeGroupKey = findActiveGroupKey(groups, tenantPath);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COLLAPSED_GROUPS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        if (parsed && typeof parsed === "object") setCollapsed(parsed);
      }
    } catch {
      // Ignore malformed persisted state.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        COLLAPSED_GROUPS_KEY,
        JSON.stringify(collapsed),
      );
    } catch {
      // Storage may be unavailable in private modes.
    }
  }, [collapsed, hydrated]);

  // The active department always expands when navigation changes.
  useEffect(() => {
    if (!activeGroupKey) return;
    setCollapsed((previous) =>
      previous[activeGroupKey]
        ? { ...previous, [activeGroupKey]: false }
        : previous,
    );
  }, [activeGroupKey]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [tenantPath]);

  if (!user) return null;

  const toggleGroup = (key: string) => {
    setCollapsed((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border md:flex">
      <div className="flex h-14 items-center px-6">
        <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
          Clasp Workspace
        </Link>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <ul className="flex flex-col gap-3">
          {groups.map((group) => (
            <SidebarGroup
              key={group.key}
              group={group}
              open={!collapsed[group.key]}
              isActive={(href) => isModuleActive(tenantPath, href)}
              onToggle={() => toggleGroup(group.key)}
              activeRef={activeRef}
            />
          ))}
        </ul>
      </nav>
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {initials(user.name, user.email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {roleLabel(user.role)}
            </p>
          </div>
          {user.roleEnhanced ? (
            <Badge
              variant="secondary"
              aria-label="Role enhanced"
              title="Your access is enhanced by groups or overrides."
            >
              Role+
            </Badge>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
