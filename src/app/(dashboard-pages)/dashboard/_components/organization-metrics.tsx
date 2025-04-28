// src/app/(dashboard-pages)/dashboard/_components/organization-metrics.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metric } from "../types";
import { getIconComponent } from "@/lib/modules";

export function OrganizationMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = getIconComponent(metric.icon);
        return (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon />
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
