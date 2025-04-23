// src/app/(dashboard-pages)/dashboard/_components/audit-log.tsx
import { AuditLogEntry } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


export function AuditLog({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>Target</TableHead>
          <TableHead>Initiator</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.action}</TableCell>
            <TableCell>{entry.target}</TableCell>
            <TableCell>{entry.initiator}</TableCell>
            <TableCell>{entry.timestamp.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
