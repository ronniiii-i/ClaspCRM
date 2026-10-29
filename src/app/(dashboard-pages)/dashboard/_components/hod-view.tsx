"use client";

import { Department, useDashboardData } from "../_hooks/use-dashboard-data";
import { DepartmentMetrics } from "./department_metrics";
import { TeamPerformanceWidget } from "./team-performance-widget";
import { BudgetAlerts } from "./budget-alerts";
import { DashboardSkeleton } from "./skeleton";
import { DashboardEmpty, DashboardError } from "./dashboard-states";

/**
 * Fallback department view for HODs whose department has no bespoke widget
 * set (Operations, Administration, and any department added later).
 */
export function HodDashboard({ department }: { department?: Department }) {
  const { data, isLoading, isError, error, refetch, isEmpty } =
    useDashboardData({
      scope: "department",
      ...(department ? { department } : {}),
    });

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
        title="No department data available"
        description="Metrics and budget alerts will appear here once records exist for your department."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {department ? `${department} Dashboard` : "Department Dashboard"}
      </h1>
      <DepartmentMetrics metrics={data.metrics} />
      <TeamPerformanceWidget
        teams={data.teamMetrics || data.teamMetric || []}
        showIndividual={false}
      />
      <BudgetAlerts alerts={data.alerts || []} />
    </div>
  );
}
