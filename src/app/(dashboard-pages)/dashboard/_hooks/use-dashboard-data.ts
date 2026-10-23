"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type {
  DashboardData,
  Metric,
  DepartmentPerformance,
  AuditLogItem,
  TeamMetric,
  Alert,
  PersonalMetric,
  Task,
  Approval,
  AttendanceRecord,
  LeaveRequest,
  TaxRecord,
  SecurityAlert,
  JobOpening,
  Training,
  PerformanceReview,
  InventoryItem,
  RevenueData,
  BudgetData,
  SystemMetrics,
  Employee,
  Ticket,
  Deal,
} from "../types";

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

export type DashboardScope =
  | "organization"
  | "department"
  | "team"
  | "individual";

export interface DashboardParams {
  scope: DashboardScope;
  department?: Department;
  teamId?: string;
  userId?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API;

interface BackendMetric {
  id: string;
  title: string;
  value: number;
  format: "currency" | "percent" | "number" | "hours";
  icon: string;
  change?: number;
  progress?: number;
}

interface BackendDashboardWidgetPayload {
  scope: DashboardScope;
  generatedAt: string;
  metrics: BackendMetric[];
  departmentPerformance?: Array<{ name: string; revenue: number }>;
  auditLog?: Array<{
    id: string;
    action: string;
    entity: string;
    target?: string;
    timestamp: string;
    initiator: string;
  }>;
  systemAlerts?: Array<{ id: string; title: string; priority: string; message: string }>;
  pendingApprovals?: Array<{ id: string; type: string; requester: string; status: string }>;
  teamMetrics?: Array<{ team: string; performance: number; members: number }>;
  alerts?: Array<{ id: string; title: string; priority: string; message: string }>;
  revenueData?: Array<{ month: string; revenue: number }>;
  budgetData?: Array<{ month: string; planned: number; actual: number }>;
  taxRecords?: TaxRecord[];
  systemMetrics?: SystemMetrics;
  inventory?: InventoryItem[];
  securityAlerts?: SecurityAlert[];
  employees?: Employee[];
  jobOpenings?: JobOpening[];
  trainings?: Training[];
  reviews?: PerformanceReview[];
  deals?: Deal[];
  tickets?: Ticket[];
  tasks?: Task[];
  attendance?: AttendanceRecord[];
  personalMetrics?: BackendMetric[];
  leaveRequests?: LeaveRequest[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000000 ? 1 : 0,
  }).format(value);
}

function formatMetricValue(metric: BackendMetric): string {
  switch (metric.format) {
    case "currency":
      return formatCurrency(metric.value);
    case "percent":
      return `${metric.value}%`;
    case "hours":
      return `${metric.value}h`;
    case "number":
    default:
      return metric.value.toLocaleString("en-US");
  }
}

function mapBackendMetric(metric: BackendMetric): Metric {
  return {
    id: metric.id,
    title: metric.title,
    value: formatMetricValue(metric),
    change: metric.change !== undefined ? `${metric.change > 0 ? "+" : ""}${metric.change}%` : undefined,
    progress: metric.progress,
    icon: metric.icon,
  };
}

function mapAuditLog(entries: NonNullable<BackendDashboardWidgetPayload["auditLog"]>): AuditLogItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    action: entry.action,
    timestamp: new Date(entry.timestamp),
    target: entry.target,
    initiator: entry.initiator,
  }));
}

function mapAlerts(alerts: NonNullable<BackendDashboardWidgetPayload["systemAlerts"]>): Alert[] {
  return alerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    priority: alert.priority as Alert["priority"],
    message: alert.message,
  }));
}

function mapApprovals(approvals: NonNullable<BackendDashboardWidgetPayload["pendingApprovals"]>): Approval[] {
  return approvals.map((approval) => ({
    id: approval.id,
    type: approval.type,
    requester: approval.requester,
    status: approval.status as Approval["status"],
  }));
}

function mapTeamMetrics(teams: NonNullable<BackendDashboardWidgetPayload["teamMetrics"]>): TeamMetric[] {
  return teams.map((team) => ({
    team: team.team,
    performance: team.performance,
    members: team.members,
  }));
}

function mapPersonalMetrics(metrics: BackendMetric[]): PersonalMetric[] {
  return metrics.map((metric) => {
    const mapped = mapBackendMetric(metric);
    const pm = {
      id: mapped.id,
      title: mapped.title,
      value: metric.value,
      format: metric.format,
      icon: mapped.icon as unknown,
      change: metric.change,
      progress: mapped.progress,
    };
    return pm as unknown as PersonalMetric;
  });
}

function mapDashboardPayload(payload: BackendDashboardWidgetPayload): DashboardData {
  const data: DashboardData = {
    metrics: (payload.metrics ?? []).map(mapBackendMetric),
  };

  if (payload.departmentPerformance) {
    data.departmentPerformance = payload.departmentPerformance as DepartmentPerformance[];
  }
  if (payload.auditLog) {
    data.auditLog = mapAuditLog(payload.auditLog);
  }
  if (payload.systemAlerts) {
    data.alerts = mapAlerts(payload.systemAlerts);
    data.systemAlerts = mapAlerts(payload.systemAlerts);
  }
  if (payload.alerts) {
    data.alerts = mapAlerts(payload.alerts);
  }
  if (payload.pendingApprovals) {
    data.pendingApprovals = mapApprovals(payload.pendingApprovals);
  }
  if (payload.teamMetrics) {
    data.teamMetrics = mapTeamMetrics(payload.teamMetrics);
    // Backwards compatibility for components reading teamMetric
    (data as DashboardData & { teamMetric?: TeamMetric[] }).teamMetric = data.teamMetrics;
  }
  if (payload.revenueData) {
    data.revenueData = payload.revenueData as RevenueData[];
  }
  if (payload.budgetData) {
    data.budgetData = payload.budgetData as BudgetData[];
  }
  if (payload.taxRecords) {
    data.taxRecords = payload.taxRecords;
  }
  if (payload.systemMetrics) {
    data.systemMetrics = payload.systemMetrics;
  }
  if (payload.inventory) {
    data.inventory = payload.inventory;
  }
  if (payload.securityAlerts) {
    data.securityAlerts = payload.securityAlerts;
  }
  if (payload.employees) {
    data.employees = payload.employees;
  }
  if (payload.jobOpenings) {
    data.jobOpenings = payload.jobOpenings;
  }
  if (payload.trainings) {
    data.trainings = payload.trainings;
  }
  if (payload.reviews) {
    data.reviews = payload.reviews;
  }
  if (payload.deals) {
    data.deals = payload.deals;
  }
  if (payload.tickets) {
    data.tickets = payload.tickets;
  }
  if (payload.tasks) {
    data.tasks = payload.tasks;
  }
  if (payload.attendance) {
    data.attendance = payload.attendance;
  }
  if (payload.personalMetrics) {
    data.personalMetrics = mapPersonalMetrics(payload.personalMetrics);
  }
  if (payload.leaveRequests) {
    data.leaveRequests = payload.leaveRequests;
  }

  return data;
}

async function fetchDashboardWidgets(token: string): Promise<DashboardData> {
  const response = await fetch(`${API_BASE}/dashboard/widgets`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.status}`);
  }

  const payload: BackendDashboardWidgetPayload = await response.json();
  return mapDashboardPayload(payload);
}

/**
 * `GET /dashboard/widgets` is the single source of truth for every role: the
 * API derives scope and dataset from the caller's role, department and
 * permissions. The `params` argument therefore only describes *what the view
 * is showing*; it is deliberately not part of the query key, because the
 * response is identical for every scope within one session and splitting the
 * cache would double the (expensive) requests.
 */
export function useDashboardData(params: DashboardParams) {
  // `params` documents the scope the caller intends to render; the API derives
  // the real scope from the JWT. Referenced so the public signature stays
  // stable without forcing every call site to change.
  void params;
  const { token, user } = useAuth();

  const query = useQuery({
    // Scope the cache to the tenant *and* user so signing in as someone else
    // in the same tab never renders the previous user's numbers.
    queryKey: ["dashboard", "widgets", user?.tenantId ?? "global", user?.id ?? "anonymous"],
    queryFn: () => {
      if (!token) throw new Error("Not authenticated");
      return fetchDashboardWidgets(token);
    },
    enabled: Boolean(token),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    // Keep the previous payload visible while a background refresh runs so the
    // page does not collapse back to a skeleton on every navigation/refetch.
    placeholderData: (previous) => previous,
  });

  const isEmpty =
    query.data &&
    (query.data.metrics?.length ?? 0) === 0 &&
    !query.data.departmentPerformance?.length &&
    !query.data.tasks?.length &&
    !query.data.tickets?.length &&
    !query.data.deals?.length &&
    !query.data.employees?.length &&
    !query.data.inventory?.length;

  return {
    data: query.data,
    // `isLoading` is true only for the first fetch of this key. Using
    // `isFetching` here made every background refetch swap the dashboard for a
    // skeleton, which read as "the app is slow".
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isEmpty,
  };
}
