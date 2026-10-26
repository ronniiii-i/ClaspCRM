"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";

export default function DepartmentsSettingsPage() {
  const { token } = useAuthStore();
  const [departments, setDepartments] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/departments`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : data.departments || []);
      }
    } catch {
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setName("");
        await load();
      }
    } catch {}
    setSaving(false);
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Departments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input placeholder="Department name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={create} disabled={saving}>
            {saving ? "Creating..." : "Create"}
          </Button>
        </div>
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!loading && (
          <div className="flex flex-col gap-2">
            {departments.map((d) => (
              <div key={d.id} className="flex items-center justify-between border-b border-border py-2">
                <div>
                  <p className="text-sm">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.key}</p>
                </div>
              </div>
            ))}
            {departments.length === 0 && <p className="text-sm text-muted-foreground">No departments</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
