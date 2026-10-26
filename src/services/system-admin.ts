

export async function listTenants(params?: any) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/system-admin/tenants${query ? `?${query}` : ""}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load tenants");
  return res.json();
}

export async function getTenant(id: string) {
  const res = await fetch(`/api/system-admin/tenants/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load tenant");
  return res.json();
}

export async function updateTenantLifecycle(id: string, body: any) {
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
