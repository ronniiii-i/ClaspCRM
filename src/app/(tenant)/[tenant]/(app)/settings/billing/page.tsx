"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingSettingsPage() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Billing</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Workspace status and billing contact.</p>
      </CardContent>
    </Card>
  );
}
