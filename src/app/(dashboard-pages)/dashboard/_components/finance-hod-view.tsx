"use client";

import { useDashboardData, Department } from "../_hooks/use-dashboard-data";
import { FinancialOverview } from "./finance-overview";
import { BudgetVarianceChart } from "./budget-variance";
import { RevenueTrends } from "./revenue-trends";
import { TaxManagement } from "./tax-management";
import { AuditTrails } from "./audit-trails";
import { DashboardSkeleton } from "./skeleton";
import { DashboardEmpty, DashboardError } from "./dashboard-states";

/**
 * Finance and Accounting share the same widget set (per the spec, the
 * Accounting HOD reuses the Finance view) but must read from their own
 * department scope. The department is therefore a prop, never hard-coded.
 */
export function FinanceHodDashboard({
  department = Department.FINANCE,
}: {
  department?: Department;
}) {
  const { data, isLoading, isError, error, refetch, isEmpty } =
    useDashboardData({
      scope: "department",
      department,
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
        title={`No ${department.toLowerCase()} data available`}
        description="Budget, revenue and compliance widgets will appear here once records exist for this department."
      />
    );
  }

  const title =
    department === Department.ACCOUNTING
      ? "Accounting Dashboard"
      : "Finance Dashboard";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{title}</h1>

      {/* Core Widgets */}
      <FinancialOverview metrics={data.metrics} />

      <div className="grid gap-4 md:grid-cols-2">
        <BudgetVarianceChart data={data.budgetData || []} />
        <RevenueTrends data={data.revenueData || []} />
      </div>

      {/* Compliance Tools */}
      <TaxManagement taxes={data.taxRecords || []} />
      <AuditTrails logs={data.auditLog || []} />
    </div>
  );
}
