"use client";

import type { Ref } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleGroup } from "@/lib/workspace-navigation";
import { SidebarLink } from "./SidebarLink";

export function SidebarGroup({
  group,
  open,
  isActive,
  onToggle,
  activeRef,
}: {
  group: ModuleGroup;
  open: boolean;
  isActive: (href: string) => boolean;
  onToggle: () => void;
  activeRef?: Ref<HTMLAnchorElement>;
}) {
  return (
    <li className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="truncate">{group.name}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 transition-transform",
            !open && "-rotate-90",
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <ul className="flex flex-col gap-1">
          {group.modules.map((item) => (
            <SidebarLink
              key={item.id}
              module={item}
              active={isActive(item.path)}
              activeRef={activeRef}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
