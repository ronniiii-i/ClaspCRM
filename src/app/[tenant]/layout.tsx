import type { ReactNode } from "react";

export default function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { tenant: string };
}) {
  // Enforce header match if present (Next will set via middleware)
  return <>{children}</>;
}
