"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";

export default function SettingsGeneralPage() {
  const { token, refreshUserData } = useAuthStore();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tenant/settings`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (res.ok) {
        const data = await res.json();
        setName(data?.settings?.name ?? "");
        setSlug(data?.settings?.slug ?? "");

        // Keep the cached profile in sync so the header/sidebar show the
        // workspace name even when the login payload predates this field.
        const current = useAuthStore.getState().user;
        if (current && data?.settings?.name && current.tenantName !== data.settings.name) {
          useAuthStore.setState({
            user: {
              ...current,
              tenantName: data.settings.name,
              tenantSlug: data.settings.slug ?? current.tenantSlug,
            },
          });
        }
        return;
      }
      // Fall back to the cached session when the request is not available.
      setName(useAuthStore.getState().user?.tenantName ?? "");
    } catch {
      setName(useAuthStore.getState().user?.tenantName ?? "");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const save = async () => {
    if (!name.trim()) {
      toast.error("Workspace name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/tenant/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to save workspace");
      }
      const data = await res.json();
      setName(data?.settings?.name ?? name.trim());
      await refreshUserData();
      toast.success("Workspace updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save workspace");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Workspace settings</h1>
        <p className="text-sm text-muted-foreground">
          The name your team sees in the sidebar and email notifications.
        </p>
      </div>

      <Card className="max-w-2xl border-border">
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>The workspace URL is permanent.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              value={name}
              placeholder={loading ? "Loading…" : "Workspace name"}
              onChange={(event) => setName(event.target.value)}
              disabled={loading || saving}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="workspace-slug">Workspace slug</Label>
            <Input id="workspace-slug" value={slug} readOnly disabled className="font-mono" />
            <p className="text-xs text-muted-foreground">
              Sign-in address: <span className="font-mono">{slug || "your-workspace"}.localhost:3000/login</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={loading || saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
