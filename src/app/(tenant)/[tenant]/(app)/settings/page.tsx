"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsGeneralPage() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">General</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Workspace name and general settings.</p>
      </CardContent>
    </Card>
  );
}
