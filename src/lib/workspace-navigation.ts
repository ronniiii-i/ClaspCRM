import { slugify } from "./format";
import type { Module, ModuleDepartment } from "./modules";

/**
 * Navigation derivation shared by the sidebar and `useAccessibleModules`.
 *
 * The backend already returns modules in a deterministic order, but cached
 * sessions and the `user.accessibleModules` fallback may not include the
 * department object. Everything here is defensive so both shapes render the
 * same navigation.
 */

export interface ModuleGroup {
  key: string;
  name: string;
  sortOrder: number;
  modules: Module[];
}

const GLOBAL_GROUP_KEY = "workspace";
const GLOBAL_GROUP_NAME = "Workspace";
const GLOBAL_GROUP_SORT = -1;
const FALLBACK_GROUP_SORT = 1000;
const GLOBAL_GROUP_NAMES = new Set(["workspace", "general", "global", "overview"]);

function labelize(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function departmentOf(entry: Module): ModuleDepartment | null {
  if (entry.department && typeof entry.department === "object") {
    return entry.department;
  }
  return null;
}

function departmentFromPath(path: string): { key: string; name: string } | null {
  const match = /^\/dept\/([^/]+)/.exec(path);
  if (!match?.[1]) return null;
  return { key: match[1], name: labelize(match[1]) };
}

export function resolveModuleGroup(entry: Module): {
  key: string;
  name: string;
  sortOrder: number;
} {
  const department = departmentOf(entry);
  if (department) {
    return {
      key: department.key || slugify(department.name),
      name: department.name || labelize(department.key),
      sortOrder: department.sortOrder ?? FALLBACK_GROUP_SORT,
    };
  }

  const fromPath = departmentFromPath(entry.path);
  if (fromPath) {
    return { ...fromPath, sortOrder: FALLBACK_GROUP_SORT };
  }

  if (typeof entry.department === "string" && entry.department) {
    return {
      key: slugify(entry.department),
      name: labelize(entry.department),
      sortOrder: FALLBACK_GROUP_SORT,
    };
  }

  if (entry.group && !GLOBAL_GROUP_NAMES.has(entry.group.toLowerCase())) {
    return {
      key: slugify(entry.group),
      name: entry.group,
      sortOrder: FALLBACK_GROUP_SORT,
    };
  }

  return {
    key: GLOBAL_GROUP_KEY,
    name: entry.group || GLOBAL_GROUP_NAME,
    sortOrder: GLOBAL_GROUP_SORT,
  };
}

function compareModules(a: Module, b: Module): number {
  return (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name);
}

/** Group accessible modules by department, then module order. */
export function groupModules(modules: Module[]): ModuleGroup[] {
  const groups = new Map<string, ModuleGroup>();

  for (const entry of modules) {
    const { key, name, sortOrder } = resolveModuleGroup(entry);
    const existing = groups.get(key);
    if (existing) {
      existing.modules.push(entry);
    } else {
      groups.set(key, { key, name, sortOrder, modules: [entry] });
    }
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      modules: [...group.modules].sort(compareModules),
    }))
    .sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    );
}

/** Tenant URLs are canonical without the slug; strip it for active checks. */
export function stripTenantPrefix(pathname: string, tenant?: string): string {
  if (!pathname) return "/";
  if (!tenant) return pathname;
  const prefix = `/${tenant}`;
  if (pathname === prefix) return "/";
  return pathname.startsWith(`${prefix}/`)
    ? pathname.slice(prefix.length)
    : pathname;
}

export function isModuleActive(pathname: string, href: string): boolean {
  if (!pathname || !href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findActiveGroupKey(
  groups: ModuleGroup[],
  pathname: string,
): string | null {
  const active = groups.find((group) =>
    group.modules.some((entry) => isModuleActive(pathname, entry.path)),
  );
  return active?.key ?? null;
}

/**
 * Resolve the canonical `/dept/<dept>/<module>` parameters for a module
 * definition. Older catalogue rows may omit `department`, so the path is the
 * fallback.
 */
export function moduleLocation(definition: {
  key: string;
  path: string;
  department?: { key?: string } | null;
}): { deptKey: string; moduleKey: string } {
  if (definition.department?.key) {
    return { deptKey: definition.department.key, moduleKey: definition.key };
  }

  const match = /^\/dept\/([^/?#]+)\/([^/?#]+)/.exec(definition.path);
  return {
    deptKey: match?.[1] ?? "",
    moduleKey: definition.key || match?.[2] || "",
  };
}
