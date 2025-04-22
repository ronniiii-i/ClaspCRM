// src/app/(dashboard-pages)/dashboard/_components/admin-view.tsx
"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { OrganizationMetrics } from "./organization-metrics";
import { DepartmentComparisonChart } from "./department-comparison-chart";
import { AuditLog } from "./audit-log";

export function AdminDashboard() {
  const { data, isLoading } = useDashboardData({ scope: "organization" });

  if (isLoading) return <div>Loading admin dashboard...</div>;
  if (!data) return <div>No data available</div>;

  return (
    <>
      <OrganizationMetrics metrics={data.metrics} />
      {data.departmentPerformance && (
        <DepartmentComparisonChart data={data.departmentPerformance} />
      )}
      {/* {data.auditLog && <AuditLog entries={data.auditLog} />} */}
    </>
  );
}
