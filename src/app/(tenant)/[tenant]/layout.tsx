import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export default function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { tenant: string };
}) {
  const headerStore = headers();
  const tenantSlug = headerStore.get("x-tenant-slug");

  if (tenantSlug && tenantSlug !== params.tenant) {
    notFound();
  }

  return <>{children}</>;
}
