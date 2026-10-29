"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
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
import { useSystemAdminStore } from "@/stores/system-admin-store";
import {
  createTenant,
  extendTrial,
  listTenants,
  reactivateTenant,
  suspendTenant,
  updateTenantLifecycle,
  type SystemTenant,
  type TenantLifecyclePatch,
} from "@/services/system-admin";
import { formatDate, formatDateTime, formatEnum, formatRelative, slugify } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  TRIAL: "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400",
  ACTIVE: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  PAST_DUE: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  SUSPENDED: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
};

const emptyForm = {
  workspaceName: "",
  slug: "",
  ownerName: "",
  ownerEmail: "",
  password: "",
  trialDays: "14",
};

export default function SystemAdminDashboardPage() {
  const router = useRouter();
  const { admin, isLoading, initialize, logout } = useSystemAdminStore();
  const { prompt, confirm } = usePrompt();

  const [tenants, setTenants] = useState<SystemTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [slugEdited, setSlugEdited] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/system-admin/login");
    }
  }, [isLoading, admin, router]);

  const loadTenants = useCallback(async (query = search) => {
    setLoading(true);
    try {
      const data = await listTenants({ search: query });
      setTenants(data.tenants || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load tenants");
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (admin) loadTenants("");
    // Initial load only; searches are explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  useEffect(() => {
    if (!slugEdited && form.workspaceName) {
      setForm((current) => ({ ...current, slug: slugify(current.workspaceName) }));
    }
  }, [form.workspaceName, slugEdited]);

  const handleCreate = async () => {
    if (!form.workspaceName.trim() || !form.slug.trim() || !form.ownerName.trim() || !form.ownerEmail.trim()) {
      toast.error("Workspace name, slug, owner name, and owner email are required");
      return;
    }
    setCreating(true);
    try {
      const data = await createTenant({
        workspaceName: form.workspaceName.trim(),
        slug: form.slug.trim().toLowerCase(),
        ownerName: form.ownerName.trim(),
        ownerEmail: form.ownerEmail.trim().toLowerCase(),
        password: form.password.trim() || undefined,
        trialDays: form.trialDays ? Number(form.trialDays) : undefined,
      });
      toast.success(`${data.tenant?.name ?? "Tenant"} created`, {
        description: data.verificationToken
          ? `Verification token (dev only): ${data.verificationToken}`
          : "The workspace is ready.",
        duration: data.verificationToken ? 15000 : 5000,
      });
      setCreateOpen(false);
      setForm(emptyForm);
      setSlugEdited(false);
      await loadTenants("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create tenant");
    } finally {
      setCreating(false);
    }
  };

  const setStatus = async (tenant: SystemTenant, status: TenantLifecyclePatch["status"], reason?: string) => {
    try {
      await updateTenantLifecycle(tenant.id, { status, reason });
      toast.success(`${tenant.name} is now ${formatEnum(status).toLowerCase()}`);
      await loadTenants();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update tenant");
    }
  };

  const handleSuspend = async (tenant: SystemTenant) => {
    const approved = await confirm({
      title: `Suspend ${tenant.name}?`,
      description: "Every user session for this workspace will be invalidated immediately.",
      confirmLabel: "Suspend tenant",
      destructive: true,
    });
    if (!approved) return;
    try {
      await suspendTenant(tenant.id, "Suspended by system administrator");
      toast.success(`${tenant.name} suspended`);
      await loadTenants();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to suspend tenant");
    }
  };

  const handleReactivate = async (tenant: SystemTenant) => {
    try {
      await reactivateTenant(tenant.id);
      toast.success(`${tenant.name} reactivated`);
      await loadTenants();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reactivate tenant");
    }
  };

  const handleExtend = async (tenant: SystemTenant) => {
    const value = await prompt({
      title: `Extend trial for ${tenant.name}`,
      description: "Enter the number of days to add to the current trial end date.",
      label: "Days",
      type: "number",
      min: 1,
      max: 365,
      defaultValue: "7",
      required: true,
      confirmLabel: "Extend trial",
    });
    if (value === null) return;
    const days = Number(value);
    if (!Number.isFinite(days) || days < 1) {
      toast.error("Enter a whole number of days");
      return;
    }
    try {
      await extendTrial(tenant.id, days);
      toast.success(`Trial extended by ${days} day${days === 1 ? "" : "s"}`);
      await loadTenants();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to extend trial");
    }
  };

  if (isLoading || !admin) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Create workspaces, control lifecycle, and manage trials. Tenant business data stays private.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New tenant
          </Button>
          <Button variant="ghost" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search by name, slug, or owner…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") loadTenants();
            }}
          />
        </div>
        <Button variant="outline" onClick={() => loadTenants()}>
          Search
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">All tenants</CardTitle>
          <CardDescription>{tenants.length} workspace{tenants.length === 1 ? "" : "s"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Trial expires</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/system-admin/tenants/${tenant.id}`}
                        className="font-medium hover:underline"
                      >
                        {tenant.name}
                      </Link>
                      <span className="font-mono text-xs text-muted-foreground">{tenant.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_STYLES[tenant.status] ?? ""}>
                      {formatEnum(tenant.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{tenant.ownerName || "—"}</span>
                      <span className="text-xs text-muted-foreground">{tenant.ownerEmail || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(tenant.trialExpiresAt)}</span>
                      {tenant.trialExpiresAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatRelative(tenant.trialExpiresAt)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(tenant.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${tenant.name}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onSelect={() => router.push(`/system-admin/tenants/${tenant.id}`)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(tenant.status === "SUSPENDED" || tenant.status === "PAST_DUE") && (
                          <DropdownMenuItem onSelect={() => handleReactivate(tenant)}>
                            Activate workspace
                          </DropdownMenuItem>
                        )}
                        {tenant.status !== "ACTIVE" && tenant.status !== "SUSPENDED" && (
                          <DropdownMenuItem onSelect={() => setStatus(tenant, "ACTIVE", "Activated by system admin")}>
                            Mark active
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => handleExtend(tenant)}>
                          Extend trial…
                        </DropdownMenuItem>
                        {tenant.status !== "PAST_DUE" && tenant.status !== "SUSPENDED" && (
                          <DropdownMenuItem onSelect={() => setStatus(tenant, "PAST_DUE", "Marked past due by system admin")}>
                            Mark past due
                          </DropdownMenuItem>
                        )}
                        {tenant.status !== "SUSPENDED" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => handleSuspend(tenant)}>
                              Suspend
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && <p className="mt-3 text-sm text-muted-foreground">Loading…</p>}
          {!loading && tenants.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">No tenants match that search.</p>
          )}
        </CardContent>
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create a workspace"
        description="Provisioning creates default departments, roles, modules, and the tenant-admin account."
        className="max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating…" : "Create tenant"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="tenant-name">Workspace name</Label>
            <Input
              id="tenant-name"
              placeholder="Acme Inc."
              value={form.workspaceName}
              onChange={(event) => setForm({ ...form, workspaceName: event.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="tenant-slug">Slug</Label>
            <Input
              id="tenant-slug"
              placeholder="acme"
              value={form.slug}
              onChange={(event) => {
                setSlugEdited(true);
                setForm({ ...form, slug: slugify(event.target.value) });
              }}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Sign-in URL: <span className="font-mono">{form.slug || "workspace"}.localhost:3000/login</span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tenant-owner">Owner name</Label>
            <Input
              id="tenant-owner"
              placeholder="Ada Lovelace"
              value={form.ownerName}
              onChange={(event) => setForm({ ...form, ownerName: event.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tenant-email">Owner email</Label>
            <Input
              id="tenant-email"
              type="email"
              placeholder="ada@acme.com"
              value={form.ownerEmail}
              onChange={(event) => setForm({ ...form, ownerEmail: event.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tenant-password">Initial password (optional)</Label>
            <Input
              id="tenant-password"
              type="password"
              placeholder="Leave blank to email verification"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tenant-trial">Trial length (days)</Label>
            <Input
              id="tenant-trial"
              type="number"
              min={1}
              max={365}
              value={form.trialDays}
              onChange={(event) => setForm({ ...form, trialDays: event.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
