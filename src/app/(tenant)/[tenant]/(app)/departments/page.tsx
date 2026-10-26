"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DepartmentsOverviewPage() {
  const { user } = useAuth();
  const isTenantAdmin = user?.role?.isTenantAdmin;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Department Overviews</h1>
        <p className="text-sm text-muted-foreground">Visibility scoped by role and department.</p>
      </div>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isTenantAdmin
              ? "Manage departments and view metrics from Settings."
              : "You can see metrics for your department scope."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
