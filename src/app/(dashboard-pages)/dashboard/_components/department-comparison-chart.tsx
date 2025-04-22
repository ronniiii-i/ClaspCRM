// src/app/(dashboard-pages)/dashboard/_components/department-comparison-chart.tsx
import { BarChart } from "recharts";

// import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { DepartmentPerformance } from "../types";

export function DepartmentComparisonChart({
  data,
}: {
  data: DepartmentPerformance[];
}) {
  return (
    <BarChart
      data={data}
    //   index="name"
    //   categories={["revenue"]}
    //   colors={["#3b82f6"]}
    />
  );
}
