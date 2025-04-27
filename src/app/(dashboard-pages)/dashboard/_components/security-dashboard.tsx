"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SecurityAlert } from "../types";
import { AlertCircle, Shield, Lock } from "lucide-react";

interface SecurityAlertProps {
  alerts: SecurityAlert[];
}

export function SecurityDashboard({ alerts }: SecurityAlertProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="font-medium">Critical Alerts</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {alerts.filter((a) => a.severity === "critical").length}
            </p>
          </div>
          {/* Add warning and info counters similarly */}
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Recent Security Events</h3>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 border rounded-lg"
            >
              <div
                className={`mt-1 flex-shrink-0 ${
                  alert.severity === "critical"
                    ? "text-red-500"
                    : alert.severity === "warning"
                    ? "text-yellow-500"
                    : "text-blue-500"
                }`}
              >
                {alert.severity === "critical" ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <Lock className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium">{alert.message}</p>
                <p className="text-sm text-muted-foreground">
                  {alert.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
