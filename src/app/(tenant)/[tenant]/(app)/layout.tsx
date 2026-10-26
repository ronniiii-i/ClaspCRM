"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/hooks/useAuth";

export default function TenantAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const tenant = params?.tenant as string | undefined;
  const { user, isAuthenticated, initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push(`/${tenant}/login`);
    } else if (user?.tenantStatus === "PAST_DUE" || user?.tenantStatus === "SUSPENDED") {
      if (user?.role?.isTenantAdmin) {
        router.push(`/${tenant}/settings/billing`);
      } else {
        router.push(`/${tenant}/account-locked`);
      }
    }
  }, [isAuthenticated, user, tenant, router]);

  if (isAuthenticated === false || !user) {
    return null;
  }

  if (user?.tenantStatus === "PAST_DUE" || user?.tenantStatus === "SUSPENDED") {
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
