"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSystemAdminStore } from "@/stores/system-admin-store";
import { listTenants, suspendTenant, reactivateTenant, extendTrial } from "@/services/system-admin";

export default function SystemAdminDashboardPage() {
  const router = useRouter();
  const { admin, isLoading, initialize, logout } = useSystemAdminStore();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/system-admin/login");
    }
  }, [isLoading, admin, router]);

  useEffect(() => {
    if (admin) {
      loadTenants();
    }
  }, [admin]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await listTenants({ search });
      setTenants(data.tenants || data);
    } catch {
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id: string) => {
    if (!confirm("Suspend this tenant? All user sessions will be invalidated.")) return;
    try {
      await suspendTenant(id, "Suspended by system admin");
      await loadTenants();
    } catch {}
  };

  const handleReactivate = async (id: string) => {
    try {
      await reactivateTenant(id);
      await loadTenants();
    } catch {}
  };

  const handleExtend = async (id: string) => {
    try {
      await extendTrial(id, 7);
      await loadTenants();
    } catch {}
  };

  if (isLoading || !admin) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
          <p className="text-sm text-muted-foreground">Tenant lifecycle management</p>
        </div>
        <Button variant="ghost" onClick={logout}>
          Sign out
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outline" onClick={loadTenants}>
          Search
        </Button>
      </div>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">All Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Slug</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Owner</th>
                  <th className="pb-2">Seats</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(tenants) ? tenants : []).map((t) => (
                  <tr key={t.id} className="border-b border-border/60">
                    <td className="py-2">
                      <Link href={`/system-admin/tenants/${t.id}`} className="hover:underline">
                        {t.name}
                      </Link>
                    </td>
                    <td className="py-2 text-muted-foreground">{t.slug}</td>
                    <td className="py-2">{t.status}</td>
                    <td className="py-2 text-muted-foreground">{t.ownerEmail}</td>
                    <td className="py-2">{t.seatCount}</td>
                    <td className="py-2 flex gap-2">
                      {t.status !== "SUSPENDED" && (
                        <Button size="sm" variant="outline" onClick={() => handleSuspend(t.id)}>
                          Suspend
                        </Button>
                      )}
                      {t.status === "SUSPENDED" && (
                        <Button size="sm" variant="outline" onClick={() => handleReactivate(t.id)}>
                          Reactivate
                        </Button>
                      )}
                      {t.status === "TRIAL" && (
                        <Button size="sm" variant="ghost" onClick={() => handleExtend(t.id)}>
                          Extend +7
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <p className="mt-2 text-sm text-muted-foreground">Loading...</p>}
            {!loading && tenants.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No tenants</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
