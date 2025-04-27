"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
// import { Department } from "../_hooks/use-dashboard-data";;
import type {
  DashboardData,
  Metric,
  DepartmentPerformance,
  AuditLogItem,
  TeamMetric,
  Alert,
  PersonalMetric,
  Task,
  SystemAlert,
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
  FinanceMetrics,
  SystemMetrics,
  Employee,
  Ticket,
  Deal,
} from "../types";
import { CheckCircleIcon, ClockIcon, FolderIcon } from "lucide-react";

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

type DashboardScope =
  | { scope: "organization" }
  | { scope: "department"; department: Department }
  | { scope: "team"; teamId: string }
  | { scope: "individual"; userId: string };

export function useDashboardData(params: DashboardScope) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockData: DashboardData = {
          metrics: getMockMetrics(params.scope),
          ...(params.scope === "organization" && {
            departmentPerformance: getMockDepartmentPerformance(),
            auditLog: getMockAuditLog(),
            systemAlerts: getMockSystemAlerts(),
            pendingApprovals: getMockApprovals(),
          }),
          ...(params.scope === "department" && {
            teamMetrics: getMockTeamMetrics(),
            alerts: getMockAlerts(),
            ...(user?.department?.name === Department.FINANCE && {
              revenueData: getMockRevenueData(),
              budgetData: getMockBudgetData(),
              taxRecords: getMockTaxRecords(),
              financeMetrics: getMockFinanceMetrics(),
            }),
            ...(user?.department?.name === Department.IT && {
              systemMetrics: getMockSystemMetrics(),
              inventory: getMockInventory(),
              securityAlerts: getMockSecurityAlerts(),
            }),
            ...(user?.department?.name === Department.HR && {
              employees: getMockEmployees(),
              jobOpenings: getMockJobOpenings(),
              trainings: getMockTrainings(),
              reviews: getMockPerformanceReviews(),
            }),
            ...(user?.department?.name === Department.SALES && {
              deals: getMockDeals(),
            }),
            ...(user?.department?.name === Department.CUSTOMER_SUPPORT && {
              tickets: getMockTickets(),
            }),
          }),
          ...(params.scope === "team" && {
            tasks: getMockTasks(),
            attendance: getMockAttendance(),
          }),
          ...(params.scope === "individual" && {
            personalMetrics: getMockPersonalMetrics(),
            tasks: getMockTasks(),
            leaveRequests: getMockLeaveRequests(),
          }),
        };

        setData(mockData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.scope, user?.department?.name]);

  return { data, isLoading };
}

// ===== MOCK DATA GENERATORS =====

function getMockMetrics(scope: string): Metric[] {
  const baseMetrics = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: `$${scope === "organization" ? "1,234,567" : "245,678"}`,
      change: "12% ↑",
      icon: "dollar-sign",
    },
    {
      id: "productivity",
      title: "Productivity",
      value: scope === "organization" ? "85%" : "92%",
      change: "3% ↑",
      icon: "activity",
    },
  ];

  if (scope === "individual") {
    baseMetrics.push({
      id: "tasks",
      title: "Tasks Completed",
      value: "24/30",
      change: "2% ↑",
      icon: "check-circle",
    });
  }

  return baseMetrics;
}

function getMockDepartmentPerformance(): DepartmentPerformance[] {
  return [
    { name: "Sales", revenue: 500000 },
    { name: "Finance", revenue: 300000 },
    { name: "IT", revenue: 150000 },
    { name: "HR", revenue: 100000 },
    { name: "Customer Support", revenue: 200000 },
  ];
}

function getMockSystemMetrics(): SystemMetrics {
  return {
    uptime: "99.9%",
    responseTime: 142,
    serverLoad: 65,
    activeIncidents: 2,
  };
}

function getMockRevenueData(): RevenueData[] {
  return Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2023, i, 1).toLocaleString("default", { month: "short" }),
    revenue: Math.floor(Math.random() * 200000) + 100000,
  }));
}

function getMockBudgetData(): BudgetData[] {
  return Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2023, i, 1).toLocaleString("default", { month: "short" }),
    planned: Math.floor(Math.random() * 150000) + 80000,
    actual: Math.floor(Math.random() * 160000) + 70000,
  }));
}

function getMockTaxRecords(): TaxRecord[] {
  return [
    {
      id: "tax1",
      type: "Corporate Tax",
      dueDate: "2023-04-15",
      status: "paid",
      amount: 45000,
    },
    {
      id: "tax2",
      type: "VAT",
      dueDate: "2023-05-20",
      status: "pending",
      amount: 32000,
    },
  ];
}

function getMockSecurityAlerts(): SecurityAlert[] {
  return [
    {
      id: "sec1",
      severity: "critical",
      message: "Unauthorized access attempt",
      timestamp: "2023-03-15 14:30",
    },
    {
      id: "sec2",
      severity: "warning",
      message: "Outdated software detected",
      timestamp: "2023-03-14 09:15",
    },
  ];
}

function getMockEmployees(): Employee[] {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `emp${i}`,
    name: `Employee ${i + 1}`,
    position: ["Manager", "Developer", "Analyst", "Designer"][i % 4],
    department: ["Finance", "IT", "HR", "Sales"][i % 4],
    status: ["active" as const, "on-leave" as const, "terminated" as const][
      i % 3
    ],
    avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
  }));
}

function getMockPerformanceReviews(): PerformanceReview[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `rev${i}`,
    employee: `Employee ${i + 1}`,
    position: ["Manager", "Developer", "Analyst"][i % 3],
    rating: Math.floor(Math.random() * 3) + 3, // 3-5
    status: i < 5 ? "completed" : "pending",
    dueDate: `2023-04-${15 + i}`,
  }));
}

function getMockJobOpenings(): JobOpening[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `job${i}`,
    title: `Job Title ${i + 1}`,
    department: ["Finance", "IT", "HR", "Sales"][i % 4],
    applicants: Math.floor(Math.random() * 100), // Add applicants property
    status: ["sourcing", "interviewing", "offer", "filled"][i % 4] as
      | "sourcing"
      | "interviewing"
      | "offer"
      | "filled", // Adjust status to match the interface
    location: ["Remote", "On-site"][i % 2],
  }));
}

function getMockTrainings(): Training[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `train${i}`,
    name: `Training ${i + 1}`,
    participants: Math.floor(Math.random() * 50) + 10,
    completionRate: Math.floor(Math.random() * 100),
    department: ["Finance", "IT", "HR", "Sales"][i % 4],
    status: ["upcoming", "in-progress", "completed"][i % 3] as
      | "upcoming"
      | "in-progress"
      | "completed",
  }));
}

function getMockInventory(): InventoryItem[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `item${i}`,
    name: `Item ${i + 1}`,
    type: i % 2 === 0 ? "hardware" : "software",
    status: ["active", "maintenance", "retired"][i % 3] as
      | "active"
      | "maintenance"
      | "retired",
    lastUpdated: new Date(
      Date.now() - Math.random() * 10000000000
    ).toLocaleDateString(),
  }));
}

function getMockAuditLog(): AuditLogItem[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `log${i}`,
    action: ["created", "updated", "deleted"][i % 3],
    entity: ["user", "project", "task"][i % 3],
    timestamp: new Date(Date.now() - Math.random() * 10000000000),
    initiator: `User ${i + 1}`,
  }));
}

function getMockSystemAlerts(): SystemAlert[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `alert${i}`,
    type: ["info", "warning", "error"][i % 3],
    title: `System Alert ${i + 1}`,
    priority: ["low", "medium", "high"][i % 3] as "low" | "medium" | "high",
    message: `System ${["started", "stopped", "error"][i % 3]} at ${new Date(
      Date.now() - Math.random() * 10000000000
    ).toLocaleString()}`,
    timestamp: new Date(
      Date.now() - Math.random() * 10000000000
    ).toLocaleString(),
  }));
}

function getMockApprovals(): Approval[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `approval${i}`,
    type: ["leave", "expense", "purchase"][i % 3],
    status: ["pending", "approved", "rejected"][i % 3] as
      | "pending"
      | "approved"
      | "rejected",
    requester: `User ${i + 1}`,
    dateRequested: new Date(
      Date.now() - Math.random() * 10000000000
    ).toLocaleString(),
  }));
}

function getMockTeamMetrics(): TeamMetric[] {
  return Array.from({ length: 5 }, (_, i) => ({
    team: `Team ${i + 1}`,
    performance: Math.floor(Math.random() * 100),
    members: Math.floor(Math.random() * 20) + 5,
  }));
}

function getMockAlerts(): Alert[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `alert${i}`,
    title: `Alert ${i + 1}`,
    priority: ["low", "medium", "high"][i % 3] as "low" | "medium" | "high",
    message: `This is a ${["low", "medium", "high"][i % 3]} priority alert.`,
  }));
}

function getMockDeals(): Deal[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `deal${i}`,
    name: `Deal ${i + 1}`,
    value: Math.floor(Math.random() * 100000) + 10000,
    stage: ["prospect", "qualified", "negotiation", "closed"][i % 4] as
      | "prospect"
      | "qualified"
      | "negotiation"
      | "closed",
    closeDate: new Date(
      Date.now() - Math.random() * 10000000000
    ).toLocaleDateString(),
    contact: `Contact ${i + 1}`, // Added contact field
    status: ["won", "lost", "pending"][i % 3] as "won" | "lost" | "pending", // Added status field
  }));
}

function getMockTickets(): Ticket[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `ticket${i}`,
    subject: `Ticket ${i + 1}`,
    status: ["open", "resolved", "pending"][i % 3] as
      | "pending"
      | "open"
      | "resolved",
    priority: ["low", "medium", "high"][i % 3] as "low" | "medium" | "high",
    createdAt: new Date(
      Date.now() - Math.random() * 10000000000
    ).toLocaleDateString(),
  }));
}

function getMockAttendance(): AttendanceRecord[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `att${i}`,
    userId: `user${i}`,
    name: `User ${i + 1}`,
    date: new Date(
      Date.now() - Math.random() * 10000000000
    ).toLocaleDateString(),
    status: ["present", "absent", "on-leave"][i % 3] as
      | "present"
      | "absent"
      | "on-leave",
    hoursWorked: Math.floor(Math.random() * 8) + 1,
  }));
}

function getMockPersonalMetrics(): PersonalMetric[] {
  return [
    {
      id: "tasks",
      title: "Tasks Completed",
      value: "24/30",
      change: "2% ↑",
      icon: CheckCircleIcon,
    },
    {
      id: "hoursWorked",
      title: "Hours Worked",
      value: "160h",
      change: "5% ↑",
      icon: ClockIcon,
    },
    {
      id: "projectsInvolved",
      title: "Projects Involved",
      value: "5",
      change: "1% ↓",
      icon: FolderIcon,
    },
  ];
}

function getMockTasks(): Task[] {
  return Array.from({ length: 5 }, (_, i) => {
    const dueDate = `2023-04-${20 + i}`;
    const dueSoon =
      new Date(dueDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // within 7 days
    return {
      id: `task${i}`,
      title: `Task ${i + 1}`,
      status: ["not-started", "in-progress", "completed"][i % 3] as
        | "not-started"
        | "in-progress"
        | "completed",
      progress: [0, 50, 100][i % 3],
      dueDate,
      dueSoon,
      project: `Project ${String.fromCharCode(65 + (i % 3))}`,
    };
  });
}

function getMockLeaveRequests(): LeaveRequest[] {
  return [
    {
      id: "leave1",
      type: "Annual Leave",
      startDate: "2023-04-10",
      endDate: "2023-04-14",
      status: "approved",
    },
    {
      id: "leave2",
      type: "Sick Leave",
      startDate: "2023-04-18",
      endDate: "2023-04-19",
      status: "pending",
    },
  ];
}

function getMockFinanceMetrics(): FinanceMetrics {
  return {
    totalRevenue: 1000000,
    yoyGrowth: 15,
    expenses: 500000,
    profitMargin: 20,
  };
}
