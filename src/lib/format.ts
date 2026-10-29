import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

type DateInput = string | number | Date | null | undefined;

function toDate(value: DateInput): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : typeof value === "number" ? new Date(value) : parseISO(value);
  return isValid(date) ? date : null;
}

/** `6 Nov 2026` — falls back to an em dash for missing/invalid values. */
export function formatDate(value: DateInput, fallback = "—"): string {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy") : fallback;
}

/** `6 Nov 2026, 14:08` */
export function formatDateTime(value: DateInput, fallback = "—"): string {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy, HH:mm") : fallback;
}

/** `in 9 days` / `3 days ago` */
export function formatRelative(value: DateInput, fallback = "—"): string {
  const date = toDate(value);
  return date ? formatDistanceToNowStrict(date, { addSuffix: true }) : fallback;
}

export function formatEnum(value?: string | null): string {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function roleSlug(
  role?: string | { name?: string; slug?: string; isTenantAdmin?: boolean } | null,
): string {
  if (!role) return "";
  if (typeof role === "string") return role.toLowerCase();
  return (role.slug || role.name || "").toLowerCase();
}

/**
 * Roles arrive as an enum string in legacy sessions and as an object in
 * Phase 2 payloads. Render either shape without leaking `[object Object]`.
 */
export function roleLabel(
  role?: string | { name?: string; slug?: string; isTenantAdmin?: boolean } | null,
): string {
  if (!role) return "—";
  if (typeof role === "string") return formatEnum(role);
  if (role.isTenantAdmin) return role.name || "Tenant admin";
  return role.name || (role.slug ? formatEnum(role.slug) : "—");
}

export function isTenantAdminRole(
  role?: string | { isTenantAdmin?: boolean; slug?: string } | null,
): boolean {
  if (!role) return false;
  if (typeof role === "string") return role === "ADMIN" || role === "tenant_admin";
  return Boolean(role.isTenantAdmin) || role.slug === "tenant_admin";
}

export function slugify(value: string, separator = "-"): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "");
}

export function initials(name?: string | null, email?: string | null): string {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
