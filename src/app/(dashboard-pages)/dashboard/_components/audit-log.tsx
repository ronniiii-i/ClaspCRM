// src/app/(dashboard-pages)/dashboard/_components/audit-log.tsx
import { AuditLogEntry } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AuditLogTable } from "./audit-log-table";

export function AuditLog({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>Logs of stuff</CardDescription>
      </CardHeader>
      <CardContent className="relative overflow-hidden">
        <div className="overflow-auto max-h-80">
          <AuditLogTable entries={entries} />
        </div>
      </CardContent>
    </Card>
  );
}
