"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DepartmentsSettingsPage() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Departments</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Create and manage departments.</p>
      </CardContent>
    </Card>
  );
}
