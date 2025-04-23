// src/app/(dashboard-pages)/dashboard/_components/team-performance-widget.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamMetric } from "../types";
import { Progress } from "@/components/ui/progress";

interface TeamPerformanceWidgetProps {
  teams: TeamMetric[];
  showIndividual: boolean;
}

export function TeamPerformanceWidget({
  teams,
  showIndividual,
}: TeamPerformanceWidgetProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead>Performance</TableHead>
            {showIndividual && <TableHead>Members</TableHead>}
            <TableHead>Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.team}>
              <TableCell className="font-medium">{team.team}</TableCell>
              <TableCell>{team.performance}%</TableCell>
              {showIndividual && <TableCell>{team.members}</TableCell>}
              <TableCell className="text-right">
                <Progress value={team.performance} className="h-2 w-[100px]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
