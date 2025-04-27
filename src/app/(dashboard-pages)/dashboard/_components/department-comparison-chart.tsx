"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DepartmentPerformance } from "../types";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";

import {
  // ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function DepartmentComparisonChart({
  data,
}: {
  data: DepartmentPerformance[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Performance</CardTitle>
        <CardDescription>Revenue comparison across departments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "hsl(var(--chart-1))",
              },
            }}
          >
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              {/* <YAxis /> */}
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={false}
                wrapperStyle={{ outline: "none" }}
                formatter={(value: number) => [
                  "Revenue: ",
                  `$${value.toLocaleString()}`,
                ]}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={8} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}