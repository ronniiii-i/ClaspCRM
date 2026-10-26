"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserManagementPage() {
  const { user } = useAuth();
  const isTenantAdmin = user?.role?.isTenantAdmin;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">Members and invitations.</p>
      </div>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isTenantAdmin
              ? "Invite users and manage roles/departments from here."
              : "You can manage users within your scope if permitted."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
