export interface TenantListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/** Lifecycle-safe tenant fields returned by the system-admin API. */
export interface SystemTenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  ownerName?: string | null;
  ownerEmail?: string | null;
  billingEmail?: string | null;
  seatCount?: number | null;
  trialExpiresAt?: string | null;
  gracePeriodEndsAt?: string | null;
  suspendedAt?: string | null;
  lastActivityAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantLifecycleEvent {
  id: string;
  fromStatus: string;
  toStatus: string;
  reason?: string | null;
  createdAt?: string;
}

export interface TenantLifecyclePatch {
  status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED";
  reason?: string;
}

export async function listTenants(params: TenantListParams = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }
  const suffix = query.toString();
  const res = await fetch(`/api/system-admin/tenants${suffix ? `?${suffix}` : ""}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load tenants");
  return res.json();
}

export async function createTenant(body: {
  workspaceName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  password?: string;
  trialDays?: number;
}) {
  const res = await fetch(`/api/system-admin/tenants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
    throw new Error(message || "Failed to create tenant");
  }
  return data;
}

export async function getTenant(id: string) {
  const res = await fetch(`/api/system-admin/tenants/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load tenant");
  return res.json();
}

export async function updateTenantLifecycle(id: string, body: TenantLifecyclePatch) {
  const res = await fetch(`/api/system-admin/tenants/${id}/lifecycle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update tenant");
  return res.json();
}

export async function extendTrial(id: string, days: number) {
  const res = await fetch(`/api/system-admin/tenants/${id}/extend-trial`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ days }),
  });
  if (!res.ok) throw new Error("Failed to extend trial");
  return res.json();
}

export async function suspendTenant(id: string, reason?: string) {
  const res = await fetch(`/api/system-admin/tenants/${id}/suspend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Failed to suspend tenant");
  return res.json();
}

export async function reactivateTenant(id: string) {
  const res = await fetch(`/api/system-admin/tenants/${id}/reactivate`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to reactivate tenant");
  return res.json();
}
