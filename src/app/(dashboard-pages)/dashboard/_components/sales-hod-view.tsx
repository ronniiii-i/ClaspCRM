"use client";

import { Department, useDashboardData } from "../_hooks/use-dashboard-data";
import { DepartmentMetrics } from "./department_metrics";
import { SalesPipeline } from "./sales-pipeline";
import { DepartmentComparisonChart } from "./department-comparison-chart";
import { TeamPerformanceWidget } from "./team-performance-widget";
import { DashboardSkeleton } from "./skeleton";
import { DashboardEmpty, DashboardError } from "./dashboard-states";

export function SalesHodDashboard() {
  const { data, isLoading, isError, error, refetch, isEmpty } =
    useDashboardData({
      scope: "department",
      department: Department.SALES,
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
        title="No sales data available"
        description="Pipeline and team widgets will appear here once deals are recorded."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sales Dashboard</h1>

      <DepartmentMetrics metrics={data.metrics} />

      <SalesPipeline deals={data.deals || []} />

      <div className="grid gap-4 md:grid-cols-2">
        <DepartmentComparisonChart data={data.departmentPerformance || []} />
        <TeamPerformanceWidget
          teams={data.teamMetrics || data.teamMetric || []}
          showIndividual={false}
        />
      </div>
    </div>
  );
}
