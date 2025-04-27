"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaxRecord } from "../types";

// interface TaxRecord {
//   id: string;
//   type: string;
//   dueDate: string;
//   status: "paid" | "pending" | "overdue";
//   amount: number;
// }

export function TaxManagement({ taxes }: { taxes: TaxRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taxes.map((tax) => (
              <TableRow key={tax.id}>
                <TableCell>{tax.type}</TableCell>
                <TableCell>{tax.dueDate}</TableCell>
                <TableCell>${tax.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      tax.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : tax.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {tax.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
