"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuthStore } from "@/stores/auth-store";

export default function TenantAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const tenant = params?.tenant as string | undefined;
  const { user, token, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push(`/${tenant}/login`);
    } else if (!isLoading && user) {
      const tenantStatus = (user as any).tenantStatus || user?.tenant?.status;
      if (tenantStatus === "PAST_DUE" || tenantStatus === "SUSPENDED") {
        if ((user as any).role?.isTenantAdmin || (user as any).role === "ADMIN" || (user as any).isTenantAdmin) {
          router.push(`/${tenant}/settings/billing`);
        } else {
          router.push(`/${tenant}/account-locked`);
        }
      }
    }
  }, [isLoading, token, user, tenant, router]);

  if (isLoading || !token || !user) {
    return null;
  }

  const tenantStatus = (user as any).tenantStatus || (user as any).tenant?.status;
  if (tenantStatus === "PAST_DUE" || tenantStatus === "SUSPENDED") {
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
