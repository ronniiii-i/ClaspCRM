// src/app/(dashboard-pages)/dashboard/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { AdminDashboard } from "./_components/admin_view";
import {HodDashboard} from "./_components/hod-view";
// import LeadDashboard from "./_components/lead-view";
// import StaffDashboard from "./_components/staff-view";
import { DashboardSkeleton } from "./_components/skeleton";

export default function DashboardPage() {
  const { user } = useAuth();
  const { userRole } = useRoleAccess();

  if (!user) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {userRole === "ADMIN" ? "Organization" : "My"} Dashboard
      </h1>

      {userRole === "ADMIN" && <AdminDashboard />}
      {userRole === "HOD" && (
        <HodDashboard department={user.department?.name || ""} />
      )}
      {/* {userRole === "LEAD" && <LeadDashboard teamId={user.teamId || ""} />} */}
      {/* {userRole === "STAFF" && <StaffDashboard userId={user.id} />} */}
    </div>
  );
}
