// src/app/(dashboard-pages)/dashboard/_components/department-metrics.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metric } from "../types";

export function DepartmentMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
                    <Icon
                        // className="h-4 w-4 text-muted-foreground"
                    />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.change} from last period
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
