import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuditLogEntry } from "../types";

export function AuditLogTable({ entries }: { entries: AuditLogEntry[] }) {
  return (
        <Table className="min-w-full dark:bg-grey-700">
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Initiator</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-muted/50 transition-colors duration-200">
                <TableCell>{entry.action}</TableCell>
                <TableCell>{entry.target}</TableCell>
                <TableCell>{entry.initiator}</TableCell>
                <TableCell>
                  {entry.timestamp.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
  );
}
