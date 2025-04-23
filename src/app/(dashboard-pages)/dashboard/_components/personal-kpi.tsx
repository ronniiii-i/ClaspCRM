"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metric } from "../types";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCheck, CalendarCheck, LucideIcon } from "lucide-react";

interface PersonalKPIProps {
  metrics: Metric[];
}

export function PersonalKPI({ metrics }: PersonalKPIProps) {
  const iconMap: Record<string, LucideIcon> = {
    target: Target,
    completion: CheckCheck,
    attendance: CalendarCheck,
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => {
        // Handle both string keys and direct icon components
        const Icon =
          typeof metric.icon === "string"
            ? iconMap[metric.icon] || Target
            : metric.icon;

        return (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.progress !== undefined ? (
                <>
                  <Progress value={metric.progress} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.progress}% of target
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {metric.change} from last period
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
