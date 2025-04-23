"use client";

import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
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
} from "../types";

// Define the dashboard data structure
// export interface DashboardData {
//   metrics: Metric[];
//   departmentPerformance?: DepartmentPerformance[];
//   auditLog?: AuditLogItem[];
//   teamMetrics?: TeamMetric[];
//   alerts?: Alert[];
//   personalMetrics?: PersonalMetric[];
//   tasks?: Task[];
// }

type DashboardScope =
  | { scope: "organization" }
  | { scope: "department"; department: string }
  | { scope: "team"; teamId: string }
  | { scope: "individual"; userId: string };

export function useDashboardData(params: DashboardScope) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract primitive values from params
  const { scope } = params;
  const department = params.scope === "department" ? params.department : null;
  const teamId = params.scope === "team" ? params.teamId : null;
  const userId = params.scope === "individual" ? params.userId : null;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockData: DashboardData = {
          metrics: getMockMetrics(scope),
          ...(scope === "organization" && {
            departmentPerformance: getMockDepartmentPerformance(),
            auditLog: getMockAuditLog(),
          }),
          ...(scope === "department" && {
            teamMetrics: getMockTeamMetrics(),
            alerts: getMockAlerts(),
          }),
          ...(scope === "individual" && {
            personalMetrics: getMockPersonalMetrics(),
            tasks: getMockTasks(),
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
  }, [scope, department, teamId, userId, user?.role]);

  return { data, isLoading };
}

// Helper functions for mock data
function getMockMetrics(scope: string): Metric[] {
  return [
    {
      id: "revenue",
      title: "Total Revenue",
      value: "$" + (scope === "organization" ? "1,234,567" : "245,678"),
      change: "12% ↑",
      icon: DollarSign,
    },
    {
      id: "new_clients",
      title: "New Clients",
      value: (scope === "organization" ? "150" : "30"),
      change: "5% ↓",
      icon: DollarSign,
    },
    {
      id: "team_performance",
      title: "Team Performance",
      value: (scope === "organization" ? "85%" : "90%"),
      change: "3% ↑",
      icon: DollarSign,
    },
    // ... other metrics
  ];
}

function getMockDepartmentPerformance(): DepartmentPerformance[] {
  return [
    { name: "Sales", revenue: 500000 },
    { name: "Finance", revenue: 300000 },
    { name: "Marketing", revenue: 200000 },
    { name: "HR", revenue: 100000 },
    { name: "IT", revenue: 150000 },
    // ...
  ];
}

function getMockAuditLog(): AuditLogItem[] {
  return [
    {
      id: "1",
      initiator: "John Doe",
      action: "Updated client profile",
      timestamp: new Date("2025-04-20T10:30:00Z"),
    },
    {
      id: "2",
      initiator: "Jane Smith",
      action: "Closed deal #1234",
      timestamp: new Date("2025-04-21T14:15:00Z"),
    },
    {
      id: "3",
      initiator: "Alice Johnson",
      action: "Created new project",
      timestamp: new Date("2025-04-22T09:00:00Z"),
    },
    // ...
  ];
}

function getMockTeamMetrics(): TeamMetric[] {
  return [
    { team: "Sales Team Alpha", performance: 92, members: 5 },
    { team: "Customer Support", performance: 88, members: 8 },
    // ...
  ];
}

function getMockAlerts(): Alert[] {
  return [
    {
      id: "alert1",
      title: "Performance Review",
      priority: "high",
      message: "Complete Q2 team evaluations",
    },
    {
      id: "alert2",
      title: "Customer Followup",
      priority: "medium",
      message: "Schedule meeting with Enterprise clients",
    },
    // ...
  ];
}


function getMockPersonalMetrics(): PersonalMetric[] {
  return [
    {
      icon: DollarSign,
      id: "personal_metric_1",
      title: "Personal Revenue",
      value: "$50,000",
      change: "10% ↑",
    },
    {
      icon: DollarSign,
      id: "personal_metric_2",
      title: "Personal Clients",
      value: "20",
      change: "10% ↑",
    },
    // ... other personal metrics
  ];
}

function getMockTasks(): Task[] {
  return [
    {
      id: "task1",
      title: "Complete project report",
      dueDate: "2025-04-30",
      dueSoon: true,
      status: "in-progress",
      progress: 50,
      project: "Project A",
    },
    {
      id: "task2",
      title: "Prepare for client meeting",
      dueDate: "2025-05-05",
      dueSoon: false,
      status: "not-started",
      progress: 0,
      project: "Client B",
    },
    // ... other tasks
  ];
}