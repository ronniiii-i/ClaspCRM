"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { OrganizationMetrics } from "./organization-metrics";
import { DepartmentComparisonChart } from "./department-comparison-chart";
import { AuditLog } from "./audit-log";

// Define the AuditLogEntry type that matches what the AuditLog component expects
// interface AuditLogEntry {
//   id: number;
//   target: string;
//   initiator: string;
//   action: string;
//   timestamp: Date; // This is a Date, not a string
// }

export function AdminDashboard() {
  const { data, isLoading } = useDashboardData({ scope: "organization" });
  console.log("AdminDashboard data:", data); // Log the data for debugging

  if (isLoading) return <div>Loading admin dashboard...</div>;
  if (!data) return <div>No data available</div>;

  return (
    <>
      <OrganizationMetrics metrics={data.metrics} />
      {data.departmentPerformance && (
        <DepartmentComparisonChart data={data.departmentPerformance} />
      )}
      {data.auditLog && (
        <AuditLog
          entries={data.auditLog.map((item) => ({
            id: String(item.id),
            target: "target" in item ? String(item.target) : "Unknown Target",
            initiator: String(item.initiator) || "Unknown Initiator",
            action: item.action,
            timestamp: new Date(item.timestamp), // Convert string timestamp to Date object
          }))}
        />
      )}
    </>
  );
}
