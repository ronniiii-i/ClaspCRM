// src/app/(dashboard-pages)/dashboard/types.ts
import { LucideIcon } from "lucide-react";

export type DashboardData = {
  metrics: Metric[];
  departmentPerformance?: DepartmentPerformance[];
  teamMetric?: TeamMetric[];
  personalMetrics?: PersonalMetric[];
  auditLog?: AuditLogEntry[];
  tasks?: Task[];
  alerts?: Alert[];
};

export interface Metric {
  id: string;
  title: string;
  value: string;
  change?: string;
  progress?: number;
  icon: LucideIcon | string;
}

export type IconKey = "target" | "completion" | "attendance" | string;

export type DepartmentPerformance = {
  name: string;
  revenue: number;
};

export type TeamMetrics = {
  id: string;
  name: string;
  quota: number;
};

export type PersonalMetric = {
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  title: string;
  value: string;
  change?: string;
};

export type AuditLogEntry = {
  id: string;
  action: string;
  target?: string;
  timestamp: Date;
  initiator: string;
};

export interface AuditLogItem {
  id: string;
  action: string;
  timestamp: Date;
  target?: string;
  initiator: string;
}

export interface TeamMetric {
  team: string;
  performance: number;
  members: number;
}

export interface Alert {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  message: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  dueSoon: boolean;
  status: "not-started" | "in-progress" | "completed";
  progress?: number;
  project?: string;
}

// Define missing types
// interface Metric {
//   id: string;
//   title: string;
//   value: string;
//   change: string;
//   icon: React.FC<React.SVGProps<SVGSVGElement>>;
// }

// interface DepartmentPerformance {
//   name: string;
//   revenue: number;
// }


// interface Alert {
//   id: string;
//   title: string;
//   priority: "low" | "medium" | "high";
//   message: string;
// }

// interface TeamMetric {
//   team: string;
//   performance: number;
//   members: number;
// }
