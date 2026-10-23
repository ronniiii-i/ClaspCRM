"use client";

import { useDashboardData } from "../_hooks/use-dashboard-data";
import { EmployeeRecords } from "./employee-records";
import { RecruitmentPipeline } from "./recruitment-pipeline";
import { TrainingManagement } from "./training-management";
import { PerformanceReviews } from "./performance-reviews";
import { DashboardSkeleton } from "./skeleton";
import { DashboardEmpty, DashboardError } from "./dashboard-states";
import { Department } from "../_hooks/use-dashboard-data";

export function HrHodDashboard() {
  const { data, isLoading, isError, error, refetch, isEmpty } =
    useDashboardData({
      scope: "department",
      department: Department.HR,
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
        title="No HR data available"
        description="Recruitment, training and review widgets will appear here once records exist."
      />
    );
  }

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
