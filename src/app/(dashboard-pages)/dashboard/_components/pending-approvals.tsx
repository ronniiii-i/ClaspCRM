"use client";

import { Clock, Check, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Approval } from "../types";

// type Approval = {
//   id: string;
//   type: string;
//   requester: string;
//   status: "pending" | "approved" | "rejected";
// };

export function PendingApprovals({ approvals }: { approvals: Approval[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Pending Approvals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {approvals.map((approval) => (
          <div key={approval.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{approval.type}</p>
              <p className="text-sm text-muted-foreground">
                Requested by: {approval.requester}
              </p>
            </div>
            {approval.status === "pending" ? (
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
                Pending
              </span>
            ) : approval.status === "approved" ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
