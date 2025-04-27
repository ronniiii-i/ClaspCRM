"use client";

import { User, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AttendanceRecord } from "../types";

// type AttendanceRecord = {
//   userId: string;
//   name: string;
//   status: "present" | "absent" | "on-leave";
//   date: string;
// };

export function TeamAttendance({ records }: { records: AttendanceRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Team Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.userId} className="flex items-center gap-4">
              <div
                className={`h-3 w-3 rounded-full ${
                  record.status === "present"
                    ? "bg-green-500"
                    : record.status === "absent"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              />
              <div className="flex-1">
                <p className="font-medium">{record.name}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {record.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
