"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { DashboardSkeleton } from "./skeleton";
import { DashboardEmpty, DashboardError } from "./dashboard-states";
import { PersonalKPI } from "./personal-kpi";
import { TasksWidget } from "./tasks-widget";
import { LeaveStatus } from "./leave-status";

export function StaffDashboard({ userId }: { userId: string }) {
  const { data, isLoading, isError, error, refetch, isEmpty } =
    useDashboardData({
      scope: "individual",
      userId,
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
        title="Nothing assigned to you yet"
        description="Your tasks, leave requests and personal metrics will appear here."
      />
    );
  }

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
