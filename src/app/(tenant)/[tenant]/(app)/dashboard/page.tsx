"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();

  const isTenantAdmin = user?.role?.isTenantAdmin;
  const dataScope = user?.role?.dataScope;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {isTenantAdmin ? "Global metrics" : `Scope: ${dataScope || "SELF"}`}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Dashboard views are driven by role data scope. Configure roles and permissions in Settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
