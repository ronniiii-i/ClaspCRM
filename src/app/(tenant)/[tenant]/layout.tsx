import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

interface TenantLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}

async function confirmTenant(slug: string): Promise<void> {
  const apiBase = process.env.NEXT_PUBLIC_API;
  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API is not configured");
  }

  const response = await fetch(
    `${apiBase}/public/workspaces/${encodeURIComponent(slug)}`,
    { next: { revalidate: 60 } },
  );
  const data = await response.json().catch(() => null);

  if (!response.ok || data?.workspace?.slug !== slug) {
    notFound();
  }
}

export default async function TenantLayout(props: TenantLayoutProps) {
  const children = props.children;
  const resolvedParams = await props.params;
  const tenant = resolvedParams?.tenant?.toLowerCase();
  if (!tenant) {
    notFound();
  }

  await confirmTenant(tenant);

  const headerStore = await headers();
  const tenantSlug = headerStore.get("x-tenant-slug");

  if (tenantSlug && tenantSlug !== tenant) {
    notFound();
  }

  return <>{children}</>;
}
