"use client";

import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePrompt } from "@/components/providers/PromptProvider";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";
const DATA_SCOPES = ["SELF", "TEAM", "DEPARTMENT"];

type GrantMap = Record<string, boolean>;

interface RoleRecord {
  id: string;
  name: string;
  description?: string | null;
  dataScope?: string;
  rank?: number;
  isSystem?: boolean;
  isTenantAdmin?: boolean;
  _count?: { users?: number };
}

interface CatalogModule {
  key: string;
  name: string;
  actions?: string[];
}

interface CatalogGroup {
  name: string;
  modules: CatalogModule[];
}

interface PermissionCatalog {
  actions?: string[];
  groups?: CatalogGroup[];
}

const grantKey = (moduleKey: string, action: string) => `${moduleKey}::${action}`;

export default function RolesSettingsPage() {
  const { token } = useAuthStore();
  const { confirm } = usePrompt();

  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [grants, setGrants] = useState<GrantMap>({});
  const [grantsLoading, setGrantsLoading] = useState(false);
  const [immutable, setImmutable] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", dataScope: "SELF", rank: "" });

  const authHeaders = useCallback(
    (json = false) => ({
      ...(json ? { "Content-Type": "application/json" } : {}),
      Authorization: token ? `Bearer ${token}` : "",
    }),
    [token],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, catalogRes] = await Promise.all([
        fetch(`${API_BASE}/roles`, { headers: authHeaders() }),
        fetch(`${API_BASE}/access-control/catalog`, { headers: authHeaders() }),
      ]);
      if (!rolesRes.ok) throw new Error("Failed to load roles");
      if (!catalogRes.ok) throw new Error("Failed to load permission catalog");

      const rolesData = await rolesRes.json();
      const catalogData = await catalogRes.json();
      const nextRoles: RoleRecord[] = Array.isArray(rolesData) ? rolesData : rolesData.roles || [];

      setRoles(nextRoles);
      setCatalog(catalogData);
      setSelectedRoleId((current) => {
        if (current && nextRoles.some((role) => role.id === current)) return current;
        return nextRoles.find((role) => !role.isTenantAdmin)?.id ?? nextRoles[0]?.id ?? "";
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const loadGrants = useCallback(
    async (roleId: string) => {
      if (!roleId) return;
      setGrantsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/access-control/roles/${roleId}/permissions`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Failed to load role permissions");
        const data = await res.json();
        const next: GrantMap = {};
        for (const grant of data.grants || []) {
          next[grantKey(grant.moduleKey, grant.action)] = !!grant.granted;
        }
        setGrants(next);
        setImmutable(!!data.immutable);
      } catch (error) {
        setGrants({});
        setImmutable(false);
        toast.error(error instanceof Error ? error.message : "Failed to load role permissions");
      } finally {
        setGrantsLoading(false);
      }
    },
    [authHeaders],
  );

  useEffect(() => {
    if (selectedRoleId) loadGrants(selectedRoleId);
  }, [selectedRoleId, loadGrants]);

  const createRole = async () => {
    if (!form.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/roles`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          dataScope: form.dataScope,
          rank: form.rank ? Number(form.rank) : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message || "Failed to create role",
        );
      }
      toast.success(`${data.role?.name ?? "Role"} created`);
      setForm({ name: "", description: "", dataScope: "SELF", rank: "" });
      await load();
      if (data.role?.id) setSelectedRoleId(data.role.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create role");
    } finally {
      setCreating(false);
    }
  };

  const deleteRole = async (role: RoleRecord) => {
    const approved = await confirm({
      title: `Delete ${role.name}?`,
      description: "Roles with assigned members or pending invitations cannot be deleted.",
      confirmLabel: "Delete role",
      destructive: true,
    });
    if (!approved) return;

    try {
      const res = await fetch(`${API_BASE}/roles/${role.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message || "Failed to delete role",
        );
      }
      toast.success("Role deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete role");
    }
  };

  const toggleGrant = (moduleKey: string, action: string, checked: boolean) => {
    setGrants((current) => ({ ...current, [grantKey(moduleKey, action)]: checked }));
  };

  const savePermissions = async () => {
    if (!selectedRoleId) return;
    setSavingPermissions(true);
    try {
      const payload = Object.entries(grants).map(([key, granted]) => {
        const [moduleKey, action] = key.split("::");
        return { moduleKey, action, granted };
      });
      const res = await fetch(`${API_BASE}/access-control/roles/${selectedRoleId}/permissions`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify({ grants: payload }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message || "Failed to save permissions",
        );
      }
      await loadGrants(selectedRoleId);
      toast.success("Permissions saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save permissions");
    } finally {
      setSavingPermissions(false);
    }
  };

  const groups: CatalogGroup[] = catalog?.groups || [];
  const actions: string[] = catalog?.actions || ["VIEW", "CREATE", "EDIT", "DELETE"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Roles &amp; permissions</h1>
        <p className="text-sm text-muted-foreground">
          Roles bundle module permissions. Create a role here, then assign it to members in User Management.
        </p>
      </div>

      <Tabs defaultValue="roles" className="gap-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="flex flex-col gap-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Create a role</CardTitle>
              <CardDescription>
                Custom roles cannot use tenant-wide scope. Choose self, team, or department.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role-name">Name</Label>
                  <Input
                    id="role-name"
                    placeholder="Sales manager"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role-description">Description (optional)</Label>
                  <Input
                    id="role-description"
                    placeholder="Runs the sales pipeline"
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role-scope">Data scope</Label>
                  <Select
                    id="role-scope"
                    value={form.dataScope}
                    onChange={(event) => setForm({ ...form, dataScope: event.target.value })}
                  >
                    {DATA_SCOPES.map((scope) => (
                      <option key={scope} value={scope}>
                        {scope.charAt(0) + scope.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role-rank">Rank (1 highest, optional)</Label>
                  <Input
                    id="role-rank"
                    type="number"
                    min={1}
                    max={999}
                    placeholder="500"
                    value={form.rank}
                    onChange={(event) => setForm({ ...form, rank: event.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={createRole} disabled={creating}>
                  <Plus className="h-4 w-4" />
                  {creating ? "Creating…" : "Create role"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Workspace roles</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.name}</span>
                          {role.description && (
                            <span className="text-xs text-muted-foreground">{role.description}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{role.dataScope}</TableCell>
                      <TableCell>{role.rank}</TableCell>
                      <TableCell>{role._count?.users ?? 0}</TableCell>
                      <TableCell>
                        {role.isTenantAdmin ? (
                          <Badge>Tenant admin</Badge>
                        ) : role.isSystem ? (
                          <Badge variant="secondary">System</Badge>
                        ) : (
                          <Badge variant="outline">Custom</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRoleId(role.id)}
                          >
                            Permissions
                          </Button>
                          {!role.isTenantAdmin && !role.isSystem && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label={`Actions for ${role.name}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => setSelectedRoleId(role.id)}>
                                  Edit permissions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onSelect={() => deleteRole(role)}>
                                  Delete role
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {loading && <p className="mt-3 text-sm text-muted-foreground">Loading…</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="flex flex-col gap-4">
          <Card className="border-border">
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">Permission matrix</CardTitle>
                  <CardDescription>
                    Tick the actions each role may perform. Changes apply to every member with the role.
                  </CardDescription>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="matrix-role">Role</Label>
                    <Select
                      id="matrix-role"
                      value={selectedRoleId}
                      className="min-w-52"
                      onChange={(event) => setSelectedRoleId(event.target.value)}
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                          {role.isTenantAdmin ? " (read-only)" : ""}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    onClick={savePermissions}
                    disabled={!selectedRoleId || immutable || savingPermissions || grantsLoading}
                  >
                    {savingPermissions ? "Saving…" : "Save permissions"}
                  </Button>
                </div>
              </div>
              {immutable && (
                <p className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  The tenant admin role always has every permission and cannot be edited.
                </p>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {grantsLoading && <p className="text-sm text-muted-foreground">Loading permissions…</p>}
              {!grantsLoading && groups.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No modules are available yet. Reload after provisioning finishes.
                </p>
              )}
              {groups.map((group) => (
                <div key={group.name} className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">{group.name}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="min-w-48 pb-2 font-medium">Module</th>
                          {actions.map((action) => (
                            <th key={action} className="w-20 pb-2 text-center font-medium">
                              {action.charAt(0) + action.slice(1).toLowerCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(group.modules || []).map((module: CatalogModule) => (
                          <tr key={module.key} className="border-b border-border/60">
                            <td className="py-2">{module.name}</td>
                            {actions.map((action) => {
                              const key = grantKey(module.key, action);
                              return (
                                <td key={action} className="py-2 text-center">
                                  <Checkbox
                                    aria-label={`${module.name} ${action}`}
                                    checked={immutable ? true : !!grants[key]}
                                    disabled={immutable || grantsLoading}
                                    onChange={(event) =>
                                      toggleGrant(module.key, action, event.target.checked)
                                    }
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
