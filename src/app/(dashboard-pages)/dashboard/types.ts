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
  systemAlerts?: SystemAlert[];
  pendingApprovals?: Approval[];
  attendance?: AttendanceRecord[];
  leaveRequests?: LeaveRequest[];
  taxRecords?: TaxRecord[];
  securityAlerts?: SecurityAlert[];
  financeMetrics?: FinanceMetrics;
  budgetData?: BudgetData[];
  systemMetrics?: SystemMetrics;
  employees?: Employee[];
  deals?: Deal[];
  tickets?: Ticket[];
  revenueData?: RevenueData[];
  jobOpenings?: JobOpening[];
  trainings?: Training[];
  reviews?: PerformanceReview[];
  inventory?: InventoryItem[];
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
  progress?: number;
};

export type AuditLogEntry = {
  id: string;
  action: string;
  target?: string;
  timestamp: Date;
  initiator: string;
  status?: "success" | "failure";
};

export interface AuditLogItem {
  id: string;
  action: string;
  timestamp: Date;
  target?: string;
  initiator: string;
}

export interface AuditLog {
  id: string;
  action: string;
  initiator: string;
  timestamp: Date;
  status?: "success" | "failure";
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

export interface SystemAlert {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  message: string;
}

export interface Approval {
  id: string;
  type: string;
  requester: string;
  status: "pending" | "approved" | "rejected";
}

export interface AttendanceRecord {
  userId: string;
  name: string;
  status: "present" | "absent" | "on-leave";
  date: string;
}

export interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
}

export interface TaxRecord {
  id: string;
  type: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
}

export interface SecurityAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
}

export interface FinanceMetrics {
  totalRevenue: number;
  yoyGrowth: number;
  expenses: number;
  profitMargin: number;
}

export interface BudgetData {
  month: string;
  planned: number;
  actual: number;
}

export interface SystemMetrics {
  uptime: string;
  responseTime: number;
  serverLoad: number;
  activeIncidents: number;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  status: "active" | "on-leave" | "terminated";
  avatar?: string;
}

export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: "prospect" | "qualified" | "negotiation" | "closed";
  contact: string;
  closeDate: string;
  status: "won" | "lost" | "pending";
}

export interface Ticket {
  id: string;
  subject: string;
  priority: "low" | "medium" | "high";
  status: "open" | "pending" | "resolved";
  createdAt: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface TaxRecord {
  id: string;
  type: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  amount: number;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  applicants: number;
  // status: "open" | "closed";
  status: "sourcing" | "interviewing" | "offer" | "filled";
}

export interface Training {
  id: string;
  name: string;
  participants: number;
  completionRate: number;
  department: string;
  status: "upcoming" | "in-progress" | "completed";
}

export interface PerformanceReview {
  id: string;
  employee: string;
  rating: number;
  status: "pending" | "completed";
  position: string;
  dueDate: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  // type: string;
  // status: string;
  type: "hardware" | "software";
  status: "active" | "maintenance" | "retired";
  assignedTo?: string;
}
