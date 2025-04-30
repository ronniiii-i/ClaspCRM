"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AdminDashboard } from "./_components/admin_view";
import { HodDashboard as GenericHodDashboard } from "./_components/hod-view";
import { FinanceHodDashboard } from "./_components/finance-hod-view";
import { ItHodDashboard } from "./_components/it-hod-view";
import { HrHodDashboard } from "./_components/hr-hod-view";
import { TeamLeadDashboard } from "./_components/lead-view";
import { StaffDashboard } from "./_components/staff-view";
import { DashboardSkeleton } from "./_components/skeleton";
import { Department } from "./_hooks/use-dashboard-data";

export default function DashboardPage() {
  const { user, testTokenRefresh } = useAuth();

  // how to call testTokenRefresh fucnction after 1 min when page loads?
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      testTokenRefresh();
    }, 60000); // 60000 milliseconds = 1 minute

    return () => {
      clearTimeout(timeoutId);
    };
  }, [testTokenRefresh]);

  if (!user) return <DashboardSkeleton />;

  // Department-specific HOD dashboards
  if (user.role === "HOD") {
    switch (user.department?.name) {
      case "Finance":
        return <FinanceHodDashboard />;
      case "IT":
        return <ItHodDashboard />;
      case "HR":
      case "Human Resources":
        return <HrHodDashboard />;
      // Add other department
      // s...
      default:
        return (
          <GenericHodDashboard
            department={user.department?.name as Department}
          />
        );
    }
  }

  // Standard role-based dashboards
  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "LEAD":
      return <TeamLeadDashboard teamId={user.id} />; // change to teamId
    case "STAFF":
      return <StaffDashboard userId={user.id} />;
    default:
      return <div>Unauthorized</div>;
  }
}
