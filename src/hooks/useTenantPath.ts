"use client";

import { useParams, usePathname } from "next/navigation";

export function useTenantPath() {
  const params = useParams();
  const pathname = usePathname();
  const tenant = params?.tenant as string | undefined;

  if (!tenant || !pathname) {
    return pathname || "/";
  }

  const prefix = `/${tenant}`;
  if (pathname.startsWith(prefix)) {
    return pathname.slice(prefix.length) || "/";
  }

  return pathname;
}
