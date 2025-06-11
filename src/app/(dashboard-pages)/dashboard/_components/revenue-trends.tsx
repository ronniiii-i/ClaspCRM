"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { RevenueData } from "../types";

export function RevenueTrends({ data }: { data: RevenueData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer config={{}}>
          <LineChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              type="natural"
              dataKey="revenue"
              stroke="hsl(221.2 83.2% 53.3%)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
