"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate, formatDateTime, formatEnum, initials, roleLabel } from "@/lib/format";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";

interface Profile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  isVerified: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  role?: {
    id: string;
    name: string;
    slug: string;
    dataScope?: string;
    isTenantAdmin?: boolean;
    rank?: number;
  };
  department?: { id: string; name?: string; key?: string } | null;
  managedDepartment?: { id: string; name?: string; key?: string } | null;
  tenant?: { name: string; slug: string; status?: string } | null;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, token, refreshUserData } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error("Failed to load profile");
      const data: Profile = await res.json();
      setProfile(data);
      setName(data.name ?? "");
      setAvatar(data.avatarUrl ?? "");
    } catch (error) {
      // Fall back to the cached session so the page is never empty.
      if (user) {
        setProfile({
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl ?? user.avatar ?? null,
          isVerified: user.isVerified,
          status: user.status,
          role:
            typeof user.role === "object"
              ? (user.role as Profile["role"])
              : undefined,
          department: user.department,
          managedDepartment: user.managedDepartment,
          tenant: user.tenantName
            ? { name: user.tenantName, slug: user.tenantSlug ?? "" }
            : null,
        });
        setName(user.name ?? "");
        setAvatar(user.avatarUrl ?? user.avatar ?? "");
      }
      toast.error(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (token) load();
    // Load once per token; `user` is only a fallback for the error path.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const save = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ name: name.trim(), avatar: avatar.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message || "Failed to update profile",
        );
      }
      setProfile((current) => ({ ...(current as Profile), ...data }));
      await refreshUserData();
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = avatar || profile?.avatarUrl;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">My profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account details. Some fields are managed by your administrator.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit border-border">
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            {displayAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayAvatar}
                alt={profile?.name || "Profile"}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-xl font-semibold">
                {initials(profile?.name, profile?.email)}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold">{profile?.name || "—"}</p>
              <p className="text-sm text-muted-foreground">{profile?.email || "—"}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {profile?.role?.isTenantAdmin ? (
                <Badge>Tenant admin</Badge>
              ) : (
                <Badge variant="secondary">{profile?.role?.name || "Member"}</Badge>
              )}
              {profile?.isVerified ? (
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                  Verified
                </Badge>
              ) : (
                <Badge variant="destructive">Unverified</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Editable details</CardTitle>
              <CardDescription>Name and profile picture are yours to change.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-name">Display name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-avatar">Profile picture URL</Label>
                <Input
                  id="profile-avatar"
                  value={avatar}
                  onChange={(event) => setAvatar(event.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use your initials.
                </p>
              </div>
              <div>
                <Button onClick={save} disabled={loading || saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Account information</CardTitle>
              <CardDescription>Read-only details about your account.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              <DetailRow label="Email" value={profile?.email || "—"} />
              <DetailRow label="Account ID" value={<span className="font-mono text-xs">{profile?.id || "—"}</span>} />
              <DetailRow label="Workspace" value={profile?.tenant?.name || user?.tenantName || "—"} />
              <DetailRow
                label="Workspace URL"
                value={<span className="font-mono text-xs">{profile?.tenant?.slug || user?.tenantSlug || "—"}</span>}
              />
              <DetailRow label="Role" value={profile?.role?.name || roleLabel(user?.role)} />
              <DetailRow label="Data scope" value={formatEnum(profile?.role?.dataScope)} />
              <DetailRow label="Department" value={profile?.department?.name || "Unassigned"} />
              <DetailRow
                label="Manages department"
                value={profile?.managedDepartment?.name || "—"}
              />
              <DetailRow
                label="Employment status"
                value={<Badge variant="outline">{formatEnum(profile?.status)}</Badge>}
              />
              <DetailRow label="Member since" value={formatDate(profile?.createdAt)} />
              <DetailRow label="Last sign-in" value={formatDateTime(profile?.lastLoginAt)} />
              <DetailRow label="Last updated" value={formatDateTime(profile?.updatedAt)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
