"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePrompt } from "@/components/providers/PromptProvider";
import { useSystemAdminStore } from "@/stores/system-admin-store";
import {
  extendTrial,
  getTenant,
  reactivateTenant,
  suspendTenant,
  updateTenantLifecycle,
  type SystemTenant,
  type TenantLifecycleEvent,
} from "@/services/system-admin";
import {
  formatDate,
  formatDateTime,
  formatEnum,
  formatRelative,
} from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  TRIAL: "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400",
  ACTIVE: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  PAST_DUE: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  SUSPENDED: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-2.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function SystemAdminTenantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { admin, isLoading, initialize } = useSystemAdminStore();
  const { prompt, confirm } = usePrompt();

  const [tenant, setTenant] = useState<SystemTenant | null>(null);
  const [events, setEvents] = useState<TenantLifecycleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/system-admin/login");
    }
  }, [isLoading, admin, router]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getTenant(id);
      setTenant(data.tenant || data);
      setEvents(data.events || []);
    } catch (error) {
      setTenant(null);
      setEvents([]);
      toast.error(error instanceof Error ? error.message : "Failed to load tenant");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (admin && id) load();
  }, [admin, id, load]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setWorking(true);
    try {
      await action();
      toast.success(success);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setWorking(false);
    }
  };

  const handleActivate = () =>
    run(() => updateTenantLifecycle(id, { status: "ACTIVE" }), "Workspace activated");

  const handlePastDue = async () => {
    const approved = await confirm({
      title: `Mark ${tenant?.name ?? "this workspace"} past due?`,
      description:
        "The workspace stays reachable but is flagged for billing follow-up. You can activate it again at any time.",
      confirmLabel: "Mark past due",
    });
    if (!approved) return;
    await run(
      () => updateTenantLifecycle(id, { status: "PAST_DUE" }),
      "Workspace marked past due",
    );
  };

  const handleSuspend = async () => {
    const reason = await prompt({
      title: `Suspend ${tenant?.name ?? "this workspace"}?`,
      description:
        "Every user session for this workspace is invalidated immediately. Enter a reason for the audit log.",
      label: "Reason (optional)",
      placeholder: "Non-payment",
      confirmLabel: "Suspend workspace",
    });
    if (reason === null) return;
    await run(
      () => suspendTenant(id, reason.trim() || "Suspended by system administrator"),
      "Workspace suspended",
    );
  };

  const handleReactivate = () =>
    run(() => reactivateTenant(id), "Workspace reactivated");

  const handleExtend = async () => {
    const value = await prompt({
      title: `Extend trial for ${tenant?.name ?? "this workspace"}`,
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
    await run(
      () => extendTrial(id, days),
      `Trial extended by ${days} day${days === 1 ? "" : "s"}`,
    );
  };

  if (isLoading || !admin) {
    return null;
  }

  if (loading && !tenant) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!tenant) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Tenant not found.</p>
        <Button variant="outline" className="w-fit" onClick={() => router.push("/system-admin")}>
          <ArrowLeft className="h-4 w-4" />
          Back to workspaces
        </Button>
      </div>
    );
  }

  const isSuspended = tenant.status === "SUSPENDED";
  const trialExpired =
    tenant.trialExpiresAt && new Date(tenant.trialExpiresAt).getTime() < Date.now();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/system-admin"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All workspaces
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{tenant.name}</h1>
              <Badge variant="outline" className={STATUS_STYLES[tenant.status] ?? ""}>
                {formatEnum(tenant.status)}
              </Badge>
            </div>
            <p className="font-mono text-sm text-muted-foreground">{tenant.slug}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExtend} disabled={working}>
              <Clock className="h-4 w-4" />
              Extend trial
            </Button>
            {isSuspended ? (
              <Button onClick={handleReactivate} disabled={working}>
                Reactivate
              </Button>
            ) : (
              <>
                {tenant.status !== "ACTIVE" && (
                  <Button variant="outline" onClick={handleActivate} disabled={working}>
                    Activate
                  </Button>
                )}
                {tenant.status !== "PAST_DUE" && (
                  <Button variant="outline" onClick={handlePastDue} disabled={working}>
                    Mark past due
                  </Button>
                )}
                <Button variant="destructive" onClick={handleSuspend} disabled={working}>
                  <ShieldAlert className="h-4 w-4" />
                  Suspend
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Metadata</CardTitle>
            <CardDescription>
              Lifecycle and billing state. Tenant business data is not accessible here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col">
            <DetailRow label="Workspace ID" value={<span className="font-mono text-xs">{tenant.id}</span>} />
            <DetailRow label="Owner" value={tenant.ownerName || "—"} />
            <DetailRow label="Owner email" value={tenant.ownerEmail || "—"} />
            <DetailRow label="Billing email" value={tenant.billingEmail || "—"} />
            <DetailRow label="Seats" value={tenant.seatCount ?? 0} />
            <DetailRow
              label="Trial expires"
              value={
                <span className="flex items-center gap-2">
                  {formatDate(tenant.trialExpiresAt)}
                  {tenant.trialExpiresAt && (
                    <span
                      className={
                        trialExpired
                          ? "text-xs font-normal text-destructive"
                          : "text-xs font-normal text-muted-foreground"
                      }
                    >
                      {formatRelative(tenant.trialExpiresAt)}
                    </span>
                  )}
                </span>
              }
            />
            <DetailRow label="Grace period ends" value={formatDateTime(tenant.gracePeriodEndsAt)} />
            <DetailRow label="Suspended at" value={formatDateTime(tenant.suspendedAt)} />
            <DetailRow label="Last activity" value={formatDateTime(tenant.lastActivityAt)} />
            <DetailRow label="Created" value={formatDateTime(tenant.createdAt)} />
            <DetailRow label="Last updated" value={formatDateTime(tenant.updatedAt)} />
          </CardContent>
        </Card>

        <Card className="h-fit border-border">
          <CardHeader>
            <CardTitle className="text-base">Lifecycle history</CardTitle>
            <CardDescription>The last 20 changes, newest first.</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lifecycle events yet.</p>
            ) : (
              <ol className="flex flex-col gap-4">
                {events.map((event) => (
                  <li key={event.id} className="flex flex-col gap-1 border-l-2 border-border pl-3">
                    <span className="text-sm font-medium">
                      {formatEnum(event.fromStatus)} → {formatEnum(event.toStatus)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(event.createdAt)}
                    </span>
                    {event.reason && (
                      <span className="text-xs text-muted-foreground">{event.reason}</span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
