"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSystemAdminStore } from "@/stores/system-admin-store";
import { getTenant, updateTenantLifecycle, suspendTenant, reactivateTenant, extendTrial } from "@/services/system-admin";

export default function SystemAdminTenantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { admin, isLoading, initialize } = useSystemAdminStore();
  const [tenant, setTenant] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/system-admin/login");
    }
  }, [isLoading, admin, router]);

  useEffect(() => {
    if (admin && id) {
      load();
    }
  }, [admin, id]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getTenant(id);
      setTenant(data.tenant || data);
    } catch {
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirm("Suspend this tenant? All user sessions will be invalidated.")) return;
    try {
      await suspendTenant(id, reason);
      await load();
    } catch {}
  };

  const handleReactivate = async () => {
    try {
      await reactivateTenant(id);
      await load();
    } catch {}
  };

  const handleExtend = async () => {
    try {
      await extendTrial(id, 7);
      await load();
    } catch {}
  };

  if (isLoading || !admin) {
    return null;
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!tenant) {
    return <p className="text-sm text-muted-foreground">Tenant not found</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{tenant.name}</h1>
        <p className="text-sm text-muted-foreground">{tenant.slug}</p>
      </div>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div>Status: {tenant.status}</div>
          <div>Owner: {tenant.ownerEmail}</div>
          <div>Seats: {tenant.seatCount}</div>
          <div>Trial expires: {tenant.trialExpiresAt || "-"}</div>
          <div>Grace ends: {tenant.gracePeriodEndsAt || "-"}</div>
          <div>Suspended at: {tenant.suspendedAt || "-"}</div>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Lifecycle</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {tenant.status !== "SUSPENDED" && (
              <Button variant="outline" onClick={handleSuspend}>
                Suspend
              </Button>
            )}
            {tenant.status === "SUSPENDED" && (
              <Button variant="outline" onClick={handleReactivate}>
                Reactivate
              </Button>
            )}
            {tenant.status === "TRIAL" && (
              <Button variant="ghost" onClick={handleExtend}>
                Extend trial +7 days
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
