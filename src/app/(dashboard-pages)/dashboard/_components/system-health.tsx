"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Gauge } from "@/components/ui/gauge";

interface SystemMetrics {
  uptime: string;
  responseTime: number;
  serverLoad: number;
  activeIncidents: number;
}

export function SystemHealth({ metrics }: { metrics: SystemMetrics }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Uptime</p>
          <p className="text-2xl font-bold">{metrics.uptime}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Server Load</p>
          {/* <Gauge value={metrics.serverLoad} /> */}
        </div>
        {/* Add other metrics similarly */}
      </CardContent>
    </Card>
  );
}
