"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DepartmentPerformance } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
