"use client";

import type { Ref } from "react";
import Link from "next/link";
import type { Module } from "@/lib/modules";
import { getIconComponent } from "@/lib/icon-mappings";
import { cn } from "@/lib/utils";

export interface SidebarLinkProps {
  module: Module;
  active: boolean;
  activeRef?: Ref<HTMLAnchorElement>;
}

export function SidebarLink({ module: item, active, activeRef }: SidebarLinkProps) {
  const Icon =
    typeof item.icon === "function"
      ? item.icon
      : getIconComponent(item.icon ?? "layout-dashboard");

  return (
    <li>
      <Link
        ref={active ? activeRef : undefined}
        href={item.path}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          active && "bg-muted text-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{item.name}</span>
      </Link>
    </li>
  );
}
