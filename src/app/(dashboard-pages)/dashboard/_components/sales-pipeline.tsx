"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  PipelineStage,
  PipelineHeader,
  PipelineContent,
} from "@/components/ui/pipeline";
import { Deal } from "../types";

// interface Deal {
//   id: string;
//   name: string;
//   value: number;
//   stage: "prospect" | "qualified" | "negotiation" | "closed";
//   contact: string;
// }

export function SalesPipeline({ deals }: { deals: Deal[] }) {
  const stages = [
    { id: "prospect", title: "Prospect", color: "bg-blue-100" },
    { id: "qualified", title: "Qualified", color: "bg-purple-100" },
    { id: "negotiation", title: "Negotiation", color: "bg-yellow-100" },
    { id: "closed", title: "Closed", color: "bg-green-100" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto pb-2">
          {stages.map((stage) => (
            <PipelineStage key={stage.id} className={stage.color}>
              <PipelineHeader>
                <h3 className="font-medium">{stage.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {deals.filter((d) => d.stage === stage.id).length} deals
                </span>
              </PipelineHeader>
              <PipelineContent>
                {deals
                  .filter((deal) => deal.stage === stage.id)
                  .map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 border rounded-lg mb-2 bg-white"
                    >
                      <p className="font-medium">{deal.name}</p>
                      <p className="text-sm">${deal.value.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {deal.contact}
                      </p>
                    </div>
                  ))}
              </PipelineContent>
            </PipelineStage>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
