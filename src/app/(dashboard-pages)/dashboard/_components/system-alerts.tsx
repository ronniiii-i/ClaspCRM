"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Alert = {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  message: string;
};

export function SystemAlerts({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          System Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert.id} className="flex items-start gap-3">
              <span
                className={`mt-1 h-2 w-2 rounded-full ${
                  alert.priority === "high"
                    ? "bg-red-500"
                    : alert.priority === "medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              />
              <div>
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
