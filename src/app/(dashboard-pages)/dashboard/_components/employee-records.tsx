"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Employee } from "../types";

// interface Employee {
//   id: string;
//   name: string;
//   position: string;
//   department: string;
//   status: "active" | "on-leave" | "terminated";
//   avatar?: string;
// }

export function EmployeeRecords({ employees }: { employees: Employee[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Employee Records</CardTitle>
          <Input placeholder="Search employees..." className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg"
          >
            <Avatar>
              <AvatarImage src={employee.avatar} />
              <AvatarFallback>
                {employee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{employee.name}</p>
              <p className="text-sm text-muted-foreground">
                {employee.position}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs ${
                employee.status === "active"
                  ? "bg-green-100 text-green-800"
                  : employee.status === "on-leave"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {employee.status}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
