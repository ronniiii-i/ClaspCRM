import type { DataScope } from "@/lib/modules";
import { Badge } from "@/components/ui/badge";

const SCOPE_LABELS: Record<DataScope, string> = {
  TENANT: "Workspace",
  DEPARTMENT: "Department",
  TEAM: "Team",
  SELF: "My records",
};

/**
 * Explains why a user may not see every record. Department scope includes the
 * department name so the reason is obvious at a glance.
 */
export function DataScopeBadge({
  scope,
  departmentName,
}: {
  scope: DataScope;
  departmentName?: string | null;
}) {
  const label =
    scope === "DEPARTMENT" && departmentName
      ? `Scope: Department — ${departmentName}`
      : `Scope: ${SCOPE_LABELS[scope]}`;

  return (
    <Badge variant="secondary" title="Records are limited by your effective data scope.">
      {label}
    </Badge>
  );
}
