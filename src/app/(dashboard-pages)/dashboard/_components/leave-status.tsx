"use client";

import { Clock, Check, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeaveRequest } from "../types";

// type LeaveRequest = {
//   id: string;
//   type: string;
//   startDate: string;
//   endDate: string;
//   status: "pending" | "approved" | "rejected";
// };

export function LeaveStatus({ requests }: { requests: LeaveRequest[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          My Leave Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{request.type}</p>
                <p className="text-sm text-muted-foreground">
                  {request.startDate} → {request.endDate}
                </p>
              </div>
              {request.status === "pending" ? (
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
                  Pending
                </span>
              ) : request.status === "approved" ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
