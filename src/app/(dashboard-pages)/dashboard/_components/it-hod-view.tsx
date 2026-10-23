"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { SystemHealth } from "./system-health";
import { SupportTickets } from "./support-tickets";
import { TechnologyInventory } from "./technology-inventory";
import { SecurityDashboard } from "./security-dashboard";
import { DashboardSkeleton } from "./skeleton";
import { DashboardEmpty, DashboardError } from "./dashboard-states";
import { Department } from "../_hooks/use-dashboard-data";

export function ItHodDashboard() {
  const { data, isLoading, isError, error, refetch, isEmpty } =
    useDashboardData({
      scope: "department",
      department: Department.IT,
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
        title="No IT data available"
        description="System health, tickets and asset widgets will appear here once records exist."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">IT Dashboard</h1>

      {/* Core Widgets */}
      <SystemHealth
        metrics={
          data.systemMetrics || {
            uptime: "0%",
            responseTime: 0,
            serverLoad: 0,
            activeIncidents: 0,
          }
        }
      />
      <SupportTickets tickets={data.tickets || []} />

      {/* Inventory & Security */}
      <div className="grid gap-4 md:grid-cols-2">
        <TechnologyInventory items={data.inventory || []} />
        <SecurityDashboard alerts={data.securityAlerts || []} />
      </div>
    </div>
  );
}
