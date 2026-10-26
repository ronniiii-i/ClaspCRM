"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";

export default function UserManagementPage() {
  const { user, token } = useAuthStore();
  const role: any = user?.role;
  const isTenantAdmin = role?.isTenantAdmin || role === "ADMIN" || (user as any)?.isTenantAdmin;
  const [users, setUsers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [usersRes, invRes] = await Promise.all([
        fetch(`${API_BASE}/users`, { headers: { Authorization: token ? `Bearer ${token}` : "" } }),
        fetch(`${API_BASE}/invitations`, { headers: { Authorization: token ? `Bearer ${token}` : "" } }),
      ]);
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(Array.isArray(data) ? data : data.users || []);
      }
      if (invRes.ok) {
        const data = await invRes.json();
        setInvitations(Array.isArray(data) ? data : data.invitations || []);
      }
    } catch {
      setUsers([]);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const invite = async () => {
    if (!email.trim()) return;
    setInviting(true);
    try {
      const res = await fetch(`${API_BASE}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setEmail("");
        await load();
      }
    } catch {}
    setInviting(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">Members and invitations.</p>
      </div>
      {isTenantAdmin && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Invite User</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={invite} disabled={inviting}>
              {inviting ? "Inviting..." : "Invite"}
            </Button>
          </CardContent>
        </Card>
      )}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!loading && (
            <div className="flex flex-col gap-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between border-b border-border py-2">
                  <div>
                    <p className="text-sm">{u.name || u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{u.role?.name || u.role}</p>
                </div>
              ))}
              {users.length === 0 && <p className="text-sm text-muted-foreground">No members</p>}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 && <p className="text-sm text-muted-foreground">No invitations</p>}
          {invitations.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between border-b border-border py-2">
              <div>
                <p className="text-sm">{inv.email}</p>
                <p className="text-xs text-muted-foreground">{inv.status}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
