"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  useDashboardData,
  Department,
  type DashboardParams,
} from "./_hooks/use-dashboard-data";
import { DashboardSkeleton } from "./_components/skeleton";
import { AdminDashboard } from "./_components/admin_view";
import { TeamLeadDashboard } from "./_components/lead-view";
import { StaffDashboard } from "./_components/staff-view";
import { HodDashboard } from "./_components/hod-view";
import { FinanceHodDashboard } from "./_components/finance-hod-view";
import { ItHodDashboard } from "./_components/it-hod-view";
import { HrHodDashboard } from "./_components/hr-hod-view";
import { SalesHodDashboard } from "./_components/sales-hod-view";
import { SupportHodDashboard } from "./_components/support-hod-view";

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
    HR: Department.HR,
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
  // Prefer the canonical DepartmentType enum when the API provides it; the
  // display name is tenant-editable, the type is not.
  const rawDeptType =
    user?.managedDepartment?.type ?? user?.department?.type ?? rawDeptName;
  const department = resolveDepartmentEnum(rawDeptType);

  function buildScope(): DashboardParams {
    switch (user?.role) {
      case "ADMIN":
        return { scope: "organization" } as const;

      case "HOD":
        return {
          scope: "department",
          department: department || undefined,
        };

      case "LEAD":
        return { scope: "team", teamId: user.id } as const;

      default:
        return { scope: "individual", userId: user?.id ?? "" } as const;
    }
  }

  // Shares the cache key with the role view below, so this does not issue a
  // second request - it only tells us whether the first one has settled.
  const { isLoading: dataLoading } = useDashboardData(
    user
      ? buildScope()
      : ({ scope: "individual", userId: "" } as DashboardParams),
  );

  if (authLoading || !user || dataLoading) {
    return <DashboardSkeleton />;
  }

  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard />;

    case "HOD":
      // One HOD view per department, all reading the same scoped endpoint.
      switch (department) {
        case Department.FINANCE:
          return <FinanceHodDashboard department={Department.FINANCE} />;
        case Department.ACCOUNTING:
          return <FinanceHodDashboard department={Department.ACCOUNTING} />;
        case Department.IT:
          return <ItHodDashboard />;
        case Department.HR:
          return <HrHodDashboard />;
        case Department.SALES:
          return <SalesHodDashboard />;
        case Department.CUSTOMER_SUPPORT:
          return <SupportHodDashboard />;
        default:
          return <HodDashboard department={department} />;
      }

    case "LEAD":
      return <TeamLeadDashboard teamId={user.id} />;

    default:
      return <StaffDashboard userId={user.id} />;
  }
}
