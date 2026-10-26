import type { ReactNode } from "react";

export default function TenantLayout(props: any) {
  const children = props.children;
  // Enforce header match if present (Next will set via middleware)
  return <>{children}</>;
}
