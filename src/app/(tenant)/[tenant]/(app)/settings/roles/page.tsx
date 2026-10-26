"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";

export default function RolesSettingsPage() {
  const { token } = useAuthStore();
  const [roles, setRoles] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [rolesRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/roles`, { headers: { Authorization: token ? `Bearer ${token}` : "" } }),
        fetch(`${API_BASE}/access-control/catalog`, { headers: { Authorization: token ? `Bearer ${token}` : "" } }),
      ]);
      if (rolesRes.ok) {
        const data = await rolesRes.json();
        setRoles(Array.isArray(data) ? data : data.roles || []);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCatalog(data);
      }
    } catch {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!loading && (
            <div className="flex flex-col gap-2">
              {roles.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b border-border py-2">
                  <div>
                    <p className="text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.slug} • rank {r.rank} • {r.dataScope}
                    </p>
                  </div>
                  {r.isTenantAdmin && <span className="text-xs text-muted-foreground">Tenant Admin</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          {catalog ? (
            <div className="flex flex-col gap-4">
              {(catalog.groups || []).map((g: any) => (
                <div key={g.name}>
                  <p className="mb-2 text-sm font-medium">{g.name}</p>
                  <div className="grid gap-2">
                    {(g.modules || []).map((m: any) => (
                      <div key={m.key} className="flex items-center justify-between border-b border-border py-2">
                        <p className="text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{(m.actions || []).join(", ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No catalog</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
