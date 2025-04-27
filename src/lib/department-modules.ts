import { Department } from "./modules";
import {
  LineChart,
  Wallet,
  Server,
  Headset,
  Briefcase,
//   Landmark,
  ClipboardList,
  Globe,
//   PieChart,
//   Bell,
//   Calendar,
//   MessageSquare,
//   HelpCircle,
  // Shield,
  FileSearch,
  Map,
  Clock,
} from "lucide-react";

interface DepartmentModule {
  id: string;
  name: string;
  icon: React.ComponentType;
  path: string;
}

export const getDepartmentModules = (
  department: Department
): DepartmentModule[] => {
  const commonItems = [
    {
      id: "dept-overview",
      name: "Department Overview",
      icon: LineChart,
      path: `/dept/${department.toLowerCase()}/overview`,
    },
  ];

  switch (department) {
    case Department.FINANCE:
      return [
        ...commonItems,
        {
          id: "budget-management",
          name: "Budget Management",
          icon: Wallet,
          path: "/finance/budget",
        },
        {
          id: "revenue-dashboard",
          name: "Revenue Dashboard",
          icon: LineChart,
          path: "/finance/revenue",
        },
        {
          id: "audit-trails",
          name: "Audit Trails",
          icon: FileSearch,
          path: "/finance/audit",
        },
      ];
    case Department.IT:
      return [
        ...commonItems,
        {
          id: "system-health",
          name: "System Health",
          icon: Server,
          path: "/it/health",
        },
        {
          id: "support-tickets",
          name: "Support Tickets",
          icon: Headset,
          path: "/it/tickets",
        },
        {
          id: "technology-inventory",
          name: "Technology Inventory",
          icon: Server,
          path: "/it/inventory",
        },
      ];
    case Department.SALES:
      return [
        ...commonItems,
        {
          id: "sales-pipeline",
          name: "Sales Pipeline",
          icon: Globe,
          path: "/sales/pipeline",
        },
        {
          id: "territory-management",
          name: "Territory Management",
          icon: Map,
          path: "/sales/territory",
        },
      ];
    case Department.CUSTOMER_SUPPORT:
      return [
        ...commonItems,
        {
          id: "support-tickets",
          name: "Support Tickets",
          icon: Headset,
          path: "/support/tickets",
        },
        {
          id: "sla-management",
          name: "SLA Management",
          icon: Clock,
          path: "/support/sla",
        },
      ];
    case Department.HR:
      return [
        ...commonItems,
        {
          id: "employee-records",
          name: "Employee Records",
          icon: Briefcase,
          path: "/hr/records",
        },
      ];
    case Department.ACCOUNTING:
      return [
        ...commonItems,
        {
          id: "general-ledger",
          name: "General Ledger",
          icon: ClipboardList,
          path: "/accounting/ledger",
        },
      ];
    default:
      return commonItems;
  }
};
