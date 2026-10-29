import type { Metadata } from "next";
import TenantAppClientLayout from "./TenantAppClientLayout";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Clasp Workspace",
  },
  description: "Internal team workspace and department operations.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function TenantAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TenantAppClientLayout>{children}</TenantAppClientLayout>;
}
