"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useModuleDefinition } from "@/hooks/workspace/useModuleDefinition";
import { ApiError } from "@/services/api-client";
import type { Permission } from "@/lib/modules";
import { ModuleProvider } from "./ModuleContext";
import { getRenderer } from "./registry";
import { ErrorState } from "./shared/ErrorState";
import { ModuleHeader } from "./shared/ModuleHeader";
import { RendererErrorBoundary } from "./shared/RendererErrorBoundary";
import { RendererSkeleton } from "./shared/RendererSkeleton";

const KEY_PATTERN = /^[a-z0-9][a-z0-9_-]*$/i;

function BackToDashboard() {
  return (
    <Button asChild>
      <Link href="/dashboard">Back to dashboard</Link>
    </Button>
  );
}

function ModuleNotFoundState() {
  return (
    <ErrorState
      title="Module not found"
      message="This module does not exist or is not available in this workspace."
      action={<BackToDashboard />}
    />
  );
}

function ModuleForbiddenState() {
  return (
    <ErrorState
      title="You do not have access to this module"
      message="Ask a workspace administrator to grant you access."
      action={<BackToDashboard />}
    />
  );
}

function UnsupportedModuleState() {
  return (
    <ErrorState
      title="Unsupported module type"
      message="This module type is not supported by your workspace build."
      action={<BackToDashboard />}
    />
  );
}

/**
 * Resolves a dynamic module route and hands the definition to the correct
 * renderer. The JWT lives in client storage, so this is a client component.
 */
export function ModuleHost({
  deptKey,
  moduleKey,
}: {
  deptKey: string;
  moduleKey: string;
}) {
  const valid =
    KEY_PATTERN.test(deptKey) && KEY_PATTERN.test(moduleKey);
  const query = useModuleDefinition(
    valid ? deptKey : "",
    valid ? moduleKey : "",
  );

  if (!valid) return <ModuleNotFoundState />;
  if (query.isPending) return <RendererSkeleton />;

  if (query.error) {
    if (ApiError.is(query.error) && query.error.status === 404) {
      return <ModuleNotFoundState />;
    }
    if (ApiError.is(query.error) && query.error.status === 403) {
      return <ModuleForbiddenState />;
    }

    return (
      <ErrorState
        title="Could not load this module"
        message={query.error.message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const definition = query.data;
  if (!definition) return <RendererSkeleton />;

  const Renderer = getRenderer(definition.type);
  const actions = new Set<Permission>(definition.actions);
  const contextValue = {
    definition,
    entityMeta: definition.entityMeta,
    actions,
    dataScope: definition.dataScope,
    can: (action: Permission) => actions.has(action),
  };

  return (
    <div className="flex flex-col gap-6">
      <ModuleHeader definition={definition} />
      <RendererErrorBoundary>
        <ModuleProvider value={contextValue}>
          {Renderer ? (
            <Renderer definition={definition} />
          ) : (
            <UnsupportedModuleState />
          )}
        </ModuleProvider>
      </RendererErrorBoundary>
    </div>
  );
}
