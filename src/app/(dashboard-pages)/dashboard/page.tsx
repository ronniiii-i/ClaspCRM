"use client";

import { useAuth } from "@/hooks/useAuth";
import { useDashboardData, Department, type DashboardScope } from "./_hooks/use-dashboard-data";
import { DashboardSkeleton } from "./_components/skeleton";
import { AdminDashboard } from "./_components/admin_view";
// import { HodDashboard } from "./_components/hod-view";
import { FinanceHodDashboard } from "./_components/finance-hod-view";
import { ItHodDashboard } from "./_components/it-hod-view";
import { HrHodDashboard } from "./_components/hr-hod-view";
import { TeamLeadDashboard } from "./_components/lead-view";
import { StaffDashboard } from "./_components/staff-view";

// Maps whatever the DB returns (human-readable name or enum key) to the
// Department enum that DashboardScope expects.
function resolveDepartmentEnum(
  name: string | undefined,
): Department | undefined {
  if (!name) return undefined;
  const map: Record<string, Department> = {
    Finance: Department.FINANCE,
    FINANCE: Department.FINANCE,
    Accounting: Department.ACCOUNTING,
    ACCOUNTING: Department.ACCOUNTING,
    "Information Technology": Department.IT,
    INFORMATION_TECHNOLOGY: Department.IT,
    IT: Department.IT,
    Sales: Department.SALES,
    SALES: Department.SALES,
    "Customer Support": Department.CUSTOMER_SUPPORT,
    CUSTOMER_SERVICE: Department.CUSTOMER_SUPPORT,
    "Human Resources": Department.HR,
    HUMAN_RESOURCES: Department.HR,
    Administration: Department.ADMINISTRATION,
    ADMINISTRATION: Department.ADMINISTRATION,
    Operations: Department.OPERATIONS,
    OPERATIONS: Department.OPERATIONS,
  };
  return map[name];
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const rawDeptName = user?.managedDepartment?.name ?? user?.department?.name;

  function buildScope(): DashboardScope {
    switch (user?.role) {
      case "ADMIN":
        return { scope: "organization" } as const;

      case "HOD": {
        const dept = resolveDepartmentEnum(rawDeptName);
        if (dept) {
          return { scope: "department", department: dept };
        }
        return { scope: "organization" };
      }

      case "LEAD":
        return { scope: "team", teamId: user.id } as const;

      default:
        return { scope: "individual", userId: user?.id ?? "" } as const;
    }
  }

  const { isLoading: dataLoading } = useDashboardData(
    user
      ? buildScope()
      : ({ scope: "individual", userId: "" } as const),
  );

  if (authLoading || !user || dataLoading) {
    return <DashboardSkeleton />;
  }

  if (user.role === "HOD") {
    const dept = resolveDepartmentEnum(rawDeptName);
    if (dept === Department.FINANCE) return <FinanceHodDashboard />;
    if (dept === Department.IT) return <ItHodDashboard />;
    if (dept === Department.HR) return <HrHodDashboard />;
    // return <HodDashboard />;
  }

  if (user.role === "ADMIN") return <AdminDashboard />;
  if (user.role === "LEAD") return <TeamLeadDashboard teamId={user.id} />;
  return <StaffDashboard userId={user.id} />;
}
