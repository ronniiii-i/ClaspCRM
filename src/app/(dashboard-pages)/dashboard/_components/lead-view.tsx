"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { DashboardSkeleton } from "./skeleton";
import { TeamPerformanceWidget } from "./team-performance-widget";
import { TaskProgress } from "./task-progress";
import { TeamAttendance } from "./team-attendance";

export function TeamLeadDashboard({ teamId }: { teamId: string }) {
  const { data, isLoading } = useDashboardData({
    scope: "team",
    teamId,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return <div>No team data found</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team Dashboard</h1>

      {/* Team Performance */}
      <TeamPerformanceWidget
        teams={data.teamMetric || []}
        showIndividual={true} // Leads see individual stats
      />

      {/* Tasks & Attendance */}
      <TaskProgress tasks={data.tasks || []} />
      <TeamAttendance records={data.attendance || []} />
    </div>
  );
}
