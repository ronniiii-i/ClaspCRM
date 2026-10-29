import type { ReactNode } from "react";

export default function TenantLayout({ children }: { children: ReactNode }) {
  // Tenant-host requests are rewritten into this segment by the middleware.
  return <>{children}</>;
}
