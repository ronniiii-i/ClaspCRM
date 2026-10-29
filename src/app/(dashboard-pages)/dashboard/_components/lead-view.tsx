"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { DashboardSkeleton } from "./skeleton";
import { DashboardEmpty, DashboardError } from "./dashboard-states";
import { TeamPerformanceWidget } from "./team-performance-widget";
import { TaskProgress } from "./task-progress";
import { TeamAttendance } from "./team-attendance";

export function TeamLeadDashboard({ teamId }: { teamId: string }) {
  const { data, isLoading, isError, error, refetch, isEmpty } =
    useDashboardData({
      scope: "team",
      teamId,
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
        title="No team data found"
        description="Team performance, tasks and attendance will appear here once your team has records."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team Dashboard</h1>

      {/* Team Performance */}
      <TeamPerformanceWidget
        teams={data.teamMetrics || data.teamMetric || []}
        showIndividual={true} // Leads see individual stats
      />

      {/* Tasks & Attendance */}
      <TaskProgress tasks={data.tasks || []} />
      <TeamAttendance records={data.attendance || []} />
    </div>
  );
}
