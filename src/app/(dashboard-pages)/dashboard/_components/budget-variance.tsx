"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BudgetData } from "../types";

interface BudgetDataProps {
  data: BudgetData[];
}

export function BudgetVarianceChart({ data }: BudgetDataProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Variance</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer
          config={{
            planned: {
              label: "Planned",
              color: "hsl(var(--chart-1))",
            },
            actual: {
              label: "Actual",
              color: "hsl(var(--chart-2))",
            },
          }}
        >
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Legend />
            <Bar
              dataKey="planned"
              fill="hsl(212 95% 68%)"
              name="Planned"
              radius={4}
            />
            <Bar
              dataKey="actual"
              fill="hsl(221.2 83.2% 53.3%)"
              name="Actual"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}