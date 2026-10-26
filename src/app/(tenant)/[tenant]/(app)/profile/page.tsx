"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const role: any = user?.role;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Account details.</p>
      </div>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">{user?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-sm text-muted-foreground">Role: {role?.name || role}</p>
          <p className="text-sm text-muted-foreground">Department: {(user as any)?.department?.name || "—"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
