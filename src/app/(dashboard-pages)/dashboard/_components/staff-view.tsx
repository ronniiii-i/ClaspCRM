// src/app/(dashboard-pages)/dashboard/_components/staff-view.tsx
"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { PersonalKPI } from "./personal-kpi";
import { TasksWidget } from "./tasks-widget";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaffDashboard({ userId }: { userId: string }) {
  const { data, isLoading } = useDashboardData({
    scope: "individual",
    userId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
        <Skeleton className="h-[200px]" />
      </div>
    );
  }

  if (!data) return <div>Failed to load your dashboard data</div>;

  return (
    <div className="space-y-6">
      <PersonalKPI
        metrics={(data.personalMetrics || []).map((metric) => ({
          ...metric,
          icon: typeof metric.icon === "string" ? metric.icon : "default-icon", // Ensure icon is a string or compatible type
        }))}
      />
      <TasksWidget tasks={data.tasks || []} />
    </div>
  );
}
