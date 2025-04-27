"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { DashboardSkeleton } from "./skeleton";
import { PersonalKPI } from "./personal-kpi";
import { TasksWidget } from "./tasks-widget";
import { LeaveStatus } from "./leave-status";

export function StaffDashboard({ userId }: { userId: string }) {
  const { data, isLoading } = useDashboardData({
    scope: "individual",
    userId,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return <div>Failed to load your data</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Dashboard</h1>

      {/* Personal Metrics */}
      <PersonalKPI metrics={data.personalMetrics || []} />

      {/* Tasks & Leave */}
      <TasksWidget tasks={data.tasks || []} />
      <LeaveStatus requests={data.leaveRequests || []} />
    </div>
  );
}
