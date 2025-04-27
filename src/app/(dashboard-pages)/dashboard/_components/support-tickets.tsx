"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Ticket } from "../types";

// interface Ticket {
//   id: string;
//   subject: string;
//   priority: "low" | "medium" | "high";
//   status: "open" | "pending" | "resolved";
//   createdAt: string;
// }

export function SupportTickets({ tickets }: { tickets: Ticket[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open">
              Open ({tickets.filter((t) => t.status === "open").length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({tickets.filter((t) => t.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({tickets.filter((t) => t.status === "resolved").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open">
            <TicketList tickets={tickets.filter((t) => t.status === "open")} />
          </TabsContent>
          {/* Add other tabs similarly */}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TicketList({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="space-y-2">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="p-3 border rounded-lg">
          <div className="flex justify-between">
            <p className="font-medium">{ticket.subject}</p>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                ticket.priority === "high"
                  ? "bg-red-100 text-red-800"
                  : ticket.priority === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {ticket.priority}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Created: {ticket.createdAt}
          </p>
        </div>
      ))}
    </div>
  );
}
