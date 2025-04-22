"use client";

import { useState, useEffect, useMemo } from "react";
import { DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Define missing types
interface Metric {
  id: string;
  title: string;
  value: string;
  change: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface DepartmentPerformance {
  name: string;
  revenue: number;
}

interface AuditLogItem {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

interface Alert {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  message: string;
}

interface TeamMetric {
  team: string;
  performance: number;
  members: number;
}

// Define the dashboard data structure
export interface DashboardData {
  metrics: Metric[];
  departmentPerformance?: DepartmentPerformance[];
  auditLog?: AuditLogItem[];
  teamMetrics?: TeamMetric[];
  alerts?: Alert[];
}

type DashboardScope =
  | { scope: "organization" }
  | { scope: "department"; department: string }
  | { scope: "team"; teamId: string }
  | { scope: "individual"; userId: string };

export function useDashboardData(params: DashboardScope) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create stable references for complex params
  const scope = params.scope;
  const department = params.scope === "department" ? params.department : null;
  const teamId = params.scope === "team" ? params.teamId : null;
  const userId = params.scope === "individual" ? params.userId : null;

  // Memoize params to prevent unnecessary re-renders
  const memoizedParams = useMemo(
    () => params,
    [scope, department, teamId, userId]
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockData: DashboardData = {
          metrics: getMockMetrics(memoizedParams.scope),
          ...(memoizedParams.scope === "organization" && {
            departmentPerformance: getMockDepartmentPerformance(),
            auditLog: getMockAuditLog(),
          }),
          ...(memoizedParams.scope === "department" && {
            teamMetrics: getMockTeamMetrics(),
            alerts: getMockAlerts(),
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
  }, [memoizedParams, user?.role, params]); // Added params as dependency

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
    // ... other metrics
  ];
}

function getMockDepartmentPerformance(): DepartmentPerformance[] {
  return [
    { name: "Sales", revenue: 500000 },
    { name: "Finance", revenue: 300000 },
    // ...
  ];
}

// Added missing mock functions
function getMockAuditLog(): AuditLogItem[] {
  return [
    {
      id: "1",
      user: "John Doe",
      action: "Updated client profile",
      timestamp: "2025-04-20T10:30:00Z",
    },
    {
      id: "2",
      user: "Jane Smith",
      action: "Closed deal #1234",
      timestamp: "2025-04-21T14:15:00Z",
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
