"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { EmployeeRecords } from "./employee-records";
import { RecruitmentPipeline } from "./recruitment-pipeline";
import { TrainingManagement } from "./training-management";
import { PerformanceReviews } from "./performance-reviews";
import { DashboardSkeleton } from "./skeleton";
import { Department } from "../_hooks/use-dashboard-data";

export function HrHodDashboard() {
  const { data, isLoading } = useDashboardData({
    scope: "department",
    department: "HR" as Department,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return <div>No HR data available</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">HR Dashboard</h1>

      {/* Core Widgets */}
      <RecruitmentPipeline jobs={data.jobOpenings || []} />

      {/* Training & Reviews */}
      <div className="grid gap-4 md:grid-cols-2">
        <TrainingManagement trainings={data.trainings || []} />
        <PerformanceReviews reviews={data.reviews || []} />
      </div>
      <EmployeeRecords employees={data.employees || []} />
    </div>
  );
}
