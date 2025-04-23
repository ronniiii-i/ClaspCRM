// src/app/(dashboard-pages)/dashboard/_components/budget-alerts.tsx
"use client";

import { Alert } from "../types";
import { Alert as AlertComponent, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface BudgetAlertsProps {
  alerts: Alert[];
}

export function BudgetAlerts({ alerts }: BudgetAlertsProps) {
  if (alerts.length === 0) {
    return (
      <AlertComponent variant="default">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>No active alerts</AlertTitle>
        <AlertDescription>
          All budgets are within expected ranges
        </AlertDescription>
      </AlertComponent>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <AlertComponent key={alert.id} variant={alert.priority === "high" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{alert.message}</span>
            {alert.priority === "high" && (
              <ArrowUpRight className="h-4 w-4" />
            )}
          </AlertDescription>
        </AlertComponent>
      ))}
    </div>
  );
}