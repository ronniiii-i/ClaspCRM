"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { DashboardSkeleton } from "./skeleton";
import { DashboardEmpty, DashboardError } from "./dashboard-states";
import { OrganizationMetrics } from "./organization-metrics";
import { DepartmentComparisonChart } from "./department-comparison-chart";
import { AuditLog } from "./audit-log";
import { PendingApprovals } from "./pending-approvals";
import { SystemAlerts } from "./system-alerts";

export function AdminDashboard() {
  const { data, isLoading, isError, error, refetch, isEmpty } =
    useDashboardData({ scope: "organization" });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) {
    return (
      <DashboardError
        message={error?.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }
  if (!data || isEmpty) {
    return (
      <DashboardEmpty
        title="No organization data yet"
        description="Seed your tenant (departments, users, deals) to populate the admin dashboard."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Global KPIs */}
      <OrganizationMetrics metrics={data.metrics} />

      {/* Charts & Logs */}
      <div className="grid gap-4 md:grid-cols-2">
        <DepartmentComparisonChart data={data.departmentPerformance || []} />
        <AuditLog entries={data.auditLog || []} />
      </div>

      {/* Alerts & Approvals */}
      <SystemAlerts alerts={data.systemAlerts || []} />
      <PendingApprovals approvals={data.pendingApprovals || []} />
    </div>
  );
}
