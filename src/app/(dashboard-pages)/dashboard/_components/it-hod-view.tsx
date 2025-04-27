"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { SystemHealth } from "./system-health";
import { SupportTickets } from "./support-tickets";
import { TechnologyInventory } from "./technology-inventory";
// import { SecurityDashboard } from "./security-dashboard";
import { DashboardSkeleton } from "./skeleton";

export function ItHodDashboard() {
  const { data, isLoading } = useDashboardData({
    scope: "department",
    department: "IT",
  });

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return <div>No IT data available</div>;

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
        {/* <SecurityDashboard alerts={data.securityAlerts || []} /> */}
      </div>
    </div>
  );
}
