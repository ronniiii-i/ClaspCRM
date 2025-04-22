// src/app/(dashboard-pages)/dashboard/types.ts
// import { Department, User } from "@/lib/types";

export type DashboardData = {
  metrics: Metric[];
  departmentPerformance?: DepartmentPerformance[];
  teamMetrics?: TeamMetrics[];
  personalMetrics?: PersonalMetric[];
  auditLog?: AuditLogEntry[];
};

export type Metric = {
  id: string;
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType;
};

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
  id: string;
  title: string;
  value: string;
};

export type AuditLogEntry = {
  id: number;
  action: string;
  target: string;
  timestamp: Date;
  initiator: string;
};
