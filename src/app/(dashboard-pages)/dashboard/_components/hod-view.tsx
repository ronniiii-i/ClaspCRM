// src/app/(dashboard-pages)/dashboard/_components/hod-view.tsx
"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { DepartmentMetrics } from "./department_metrics";
import { TeamPerformanceWidget } from "./team-performance-widget";
import { BudgetAlerts } from "./budget-alerts";
import { DashboardSkeleton } from "./skeleton";

import { Department } from "../_hooks/use-dashboard-data";

export function HodDashboard({ department }: { department: Department }) {
  const { data, isLoading, isError } = useDashboardData({
    scope: "department",
    department,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <div className="text-red-500">Failed to load department data.</div>;
  if (!data) return <div>No department data available</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Department Dashboard</h1>
      <DepartmentMetrics metrics={data.metrics} />
      <TeamPerformanceWidget
        teams={data.teamMetrics || data.teamMetric || []}
        showIndividual={false}
      />
      <BudgetAlerts alerts={data.alerts || []} />
    </div>
  );
}
