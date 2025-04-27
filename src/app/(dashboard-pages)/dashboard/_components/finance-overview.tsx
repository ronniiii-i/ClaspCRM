"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metric } from "../types";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface FinancialOverviewProps {
  metrics: Metric[];
}

export function FinancialOverview({ metrics }: FinancialOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => {
        let Icon = DollarSign;
        let trendClass = "";

        if (metric.change?.includes("↑")) {
          Icon = TrendingUp;
          trendClass = "text-green-500";
        } else if (metric.change?.includes("↓")) {
          Icon = TrendingDown;
          trendClass = "text-red-500";
        }

        return (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${trendClass}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${trendClass}`}>
                {metric.change} from last period
              </p>
              {metric.progress && (
                <Progress value={metric.progress} className="h-2 mt-2" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
