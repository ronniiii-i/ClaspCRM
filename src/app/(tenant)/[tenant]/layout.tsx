import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export default async function TenantLayout(props: any) {
  const children = props.children;
  const params = props.params;
  const resolvedParams = typeof params?.then === "function" ? await params : params;
  const headerStore = await headers();
  const tenantSlug = headerStore.get("x-tenant-slug");

  if (tenantSlug && resolvedParams?.tenant && tenantSlug !== resolvedParams.tenant) {
    notFound();
  }

  return <>{children}</>;
}
