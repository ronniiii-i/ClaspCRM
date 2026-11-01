import type { ComponentType } from "react";
import type { DataScope, Permission } from "@/lib/modules";
import type { EntityMeta, ModuleDefinition } from "@/lib/workspace-types";

export interface ModuleRendererProps {
  definition: ModuleDefinition;
}

export type ModuleRenderer = ComponentType<ModuleRendererProps>;

export interface ModuleContextValue {
  definition: ModuleDefinition;
  entityMeta: EntityMeta | null;
  actions: Set<Permission>;
  dataScope: DataScope;
  can: (action: Permission) => boolean;
}
