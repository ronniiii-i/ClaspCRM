import { LucideIcon, Map, Server } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  BarChart,
  Wallet,
  Truck,
  Package,
  Settings,
  Home,
  Shield,
  UserRoundCog,
  Key,
  Receipt,
  Clock,
  FileSearch,
  LineChart,
  Headset,
  Briefcase,
  Landmark,
  ClipboardList,
  Globe,
  PieChart,
  Bell,
  Calendar,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

export enum Department {
  FINANCE = "Finance",
  IT = "IT",
  SALES = "Sales",
  CUSTOMER_SUPPORT = "Customer Support",
  HR = "Human Resources",
  ACCOUNTING = "Accounting",
  ADMINISTRATION = "Administration",
  OPERATIONS = "Operations",
}

export enum AccessLevel {
  VIEW = "VIEW",
  CREATE = "CREATE",
  EDIT = "EDIT",
  DELETE = "DELETE",
}

export interface Module {
  id: string;
  name: string;
  icon: LucideIcon | string;
  path: string;
  department?: Department;
  roles: {
    ADMIN: AccessLevel[];
    HOD: AccessLevel[];
    TEAM_LEAD: AccessLevel[];
    STAFF: AccessLevel[];
  };
}

export const ALL_MODULES: Module[] = [
  // Global Modules (No Department)
  {
    id: "dashboard",
    name: "Dashboard Overview",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: {
      ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT],
      HOD: [AccessLevel.VIEW],
      TEAM_LEAD: [AccessLevel.VIEW],
      STAFF: [AccessLevel.VIEW],
    },
  },
  {
    id: "analytics",
    name: "Business Intelligence",
    icon: BarChart,
    path: "/analytics",
    roles: {
      ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.DELETE],
      HOD: [AccessLevel.VIEW],
      TEAM_LEAD: [AccessLevel.VIEW],
      STAFF: [],
    },
  },
  // Administration
  {
    id: "admin-settings",
    name: "System Administration",
    icon: Settings,
    path: "/admin/settings",
    department: Department.ADMINISTRATION,
    roles: {
      ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.DELETE],
      HOD: [],
      TEAM_LEAD: [],
      STAFF: [],
    },
  },
  {
    id: "office-admin",
    name: "Office Administration",
    icon: Home,
    path: "/office",
    department: Department.ADMINISTRATION,
    roles: {
      ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.DELETE],
      HOD: [AccessLevel.VIEW],
      TEAM_LEAD: [],
      STAFF: [AccessLevel.VIEW],
    },
  },
  // Finance
  {
    id: "financial-analytics",
    name: "Financial Analytics",
    icon: Landmark,
    path: "/finance/analytics",
    department: Department.FINANCE,
    roles: {
      ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.DELETE],
      HOD: [AccessLevel.VIEW, AccessLevel.EDIT],
      TEAM_LEAD: [AccessLevel.VIEW],
      STAFF: [],
    },
  },
  {
    id: "tax-management",
    name: "Tax Management",
    icon: Receipt,
    path: "/finance/tax",
    department: Department.FINANCE,
    roles: {
      ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.DELETE],
      HOD: [AccessLevel.VIEW, AccessLevel.EDIT],
      TEAM_LEAD: [],
      STAFF: [],
    },
  },
  // IT
  {
    id: "system-health",
    name: "System Health",
    icon: Server,
    path: "/it/health",
    department: Department.IT,
    roles: {
      ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.DELETE],
      HOD: [AccessLevel.VIEW, AccessLevel.EDIT],
      TEAM_LEAD: [AccessLevel.VIEW],
      STAFF: [],
    },
  },
  // Sales
  {
    id: "sales-pipeline",
    name: "Sales Pipeline",
    icon: Globe,
    path: "/sales/pipeline",
    department: Department.SALES,
    roles: {
      ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.DELETE],
      HOD: [AccessLevel.VIEW, AccessLevel.EDIT],
      TEAM_LEAD: [AccessLevel.VIEW],
      STAFF: [AccessLevel.VIEW],
    },
  },
  {
    id: "territory-management",
    name: "Territory Management",
    icon: Map,
    path: "/sales/territory",
    department: Department.SALES,
    roles: {
      ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.DELETE],
      HOD: [AccessLevel.VIEW, AccessLevel.EDIT],
      TEAM_LEAD: [AccessLevel.VIEW],
      STAFF: [],
    },
  },
  // Customer Support
  {
    id: "sla-management",
    name: "SLA Management",
    icon: Clock,
    path: "/support/sla",
    department: Department.CUSTOMER_SUPPORT,
    roles: {
      ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.DELETE],
      HOD: [AccessLevel.VIEW, AccessLevel.EDIT],
      TEAM_LEAD: [AccessLevel.VIEW],
      STAFF: [],
    },
  },
  // HR
  {
    id: "health-safety",
    name: "Health & Safety",
    icon: Shield,
    path: "/hr/safety",
    department: Department.HR,
    roles: {
      ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.DELETE],
      HOD: [AccessLevel.VIEW, AccessLevel.EDIT],
      TEAM_LEAD: [AccessLevel.VIEW],
      STAFF: [AccessLevel.VIEW],
    },
  },
  // Accounting
  {
    id: "general-ledger",
    name: "General Ledger",
    icon: ClipboardList,
    path: "/accounting/ledger",
    department: Department.ACCOUNTING,
    roles: {
      ADMIN: [AccessLevel.VIEW, AccessLevel.EDIT, AccessLevel.DELETE],
      HOD: [AccessLevel.VIEW, AccessLevel.EDIT],
      TEAM_LEAD: [],
      STAFF: [],
    },
  },
];

export const getIconComponent = (
  icon: string | LucideIcon | React.ComponentType<{ className?: string }>
): LucideIcon => {
  if (typeof icon !== "string" && typeof (icon as LucideIcon)?.$$typeof !== "undefined") {
    return icon as LucideIcon;
  }
  const iconMap: Record<string, LucideIcon> = {
    dashboard: LayoutDashboard,
    users: Users,
    projects: FolderKanban,
    analytics: BarChart,
    wallet: Wallet,
    truck: Truck,
    package: Package,
    settings: Settings,
    home: Home,
    shield: Shield,
    "user-cog": UserRoundCog,
    key: Key,
    receipt: Receipt,
    clock: Clock,
    file: FileSearch,
    chart: LineChart,
    headset: Headset,
    briefcase: Briefcase,
    landmark: Landmark,
    clipboard: ClipboardList,
    globe: Globe,
    pie: PieChart,
    bell: Bell,
    calendar: Calendar,
    message: MessageSquare,
    help: HelpCircle,
  };
  return iconMap[icon as string] || LayoutDashboard;
};
