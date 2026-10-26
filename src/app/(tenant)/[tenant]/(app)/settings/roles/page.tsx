"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RolesSettingsPage() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Roles & Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Manage roles and permission matrix.</p>
      </CardContent>
    </Card>
  );
}
