import type { ModuleDefinition } from "@/lib/workspace-types";
import { getIconComponent } from "@/lib/icon-mappings";
import { DataScopeBadge } from "./DataScopeBadge";

/** Shared module chrome: icon, title, context and effective scope. */
export function ModuleHeader({ definition }: { definition: ModuleDefinition }) {
  const Icon = getIconComponent(definition.icon);
  const contextLabel = [definition.department?.name, definition.group]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="flex flex-col gap-3 border-b border-border pb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {definition.name}
            </h1>
            {contextLabel ? (
              <p className="text-xs text-muted-foreground">{contextLabel}</p>
            ) : null}
          </div>
        </div>
        <DataScopeBadge
          scope={definition.dataScope}
          departmentName={definition.department?.name}
        />
      </div>
      {definition.description ? (
        <p className="max-w-3xl text-sm text-muted-foreground">
          {definition.description}
        </p>
      ) : null}
    </header>
  );
}
