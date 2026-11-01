/**
 * Legacy department roots kept for bookmarked Phase 2 URLs. Every old module
 * path maps 1:1 because module keys are unchanged; only the department prefix
 * moves under `/dept/<deptKey>/`.
 */
export const LEGACY_DEPARTMENTS: Record<string, string> = {
  finance: "finance",
  accounting: "accounting",
  hr: "human_resources",
  it: "information_technology",
  sales: "sales",
  "customer-support": "customer_support",
  administration: "administration",
  operations: "operations",
};

/** `/finance/invoices` → `/dept/finance/invoices`. */
export function getLegacyDepartmentPath(pathname: string): string | null {
  const [first, ...rest] = pathname.split("/").filter(Boolean);
  if (!first) return null;

  const department = LEGACY_DEPARTMENTS[first];
  if (!department) return null;

  return `/dept/${department}${rest.length ? `/${rest.join("/")}` : ""}`;
}
