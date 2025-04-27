"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { FinancialOverview } from "./finance-overview";
import { BudgetVarianceChart } from "./budget-variance";
import { RevenueTrends } from "./revenue-trends";
import { TaxManagement } from "./tax-management";
import { AuditTrails } from "./audit-trails";
import { DashboardSkeleton } from "./skeleton";

export function FinanceHodDashboard() {
  const { data, isLoading } = useDashboardData({
    scope: "department",
    department: "Finance",
  });

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return <div>No finance data available</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Finance Dashboard</h1>

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
