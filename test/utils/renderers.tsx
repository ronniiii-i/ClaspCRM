import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { DataScope, Permission } from "@/lib/modules";
import type { EntityMeta, ModuleDefinition } from "@/lib/workspace-types";
import { ModuleProvider } from "@/components/renderers/ModuleContext";

/** Fresh query client per test; retries are disabled so failures are fast. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(ui: ReactElement) {
  const client = createTestQueryClient();
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
    ),
  };
}

/** Render a module renderer with a fully-populated module context. */
export function renderRenderer(
  renderer: ReactNode,
  options: {
    definition: ModuleDefinition;
    entityMeta?: EntityMeta | null;
    actions?: Permission[];
    dataScope?: DataScope;
  },
) {
  const actions = new Set<Permission>(options.actions ?? ["VIEW"]);

  return renderWithProviders(
    <ModuleProvider
      value={{
        definition: options.definition,
        entityMeta: options.entityMeta ?? options.definition.entityMeta,
        actions,
        dataScope: options.dataScope ?? options.definition.dataScope,
        can: (action) => actions.has(action),
      }}
    >
      {renderer}
    </ModuleProvider>,
  );
}

/** Entity metadata used by the renderer suites. */
export function buildEntityMeta(overrides: Partial<EntityMeta> = {}): EntityMeta {
  return {
    key: "invoices",
    label: "Invoice",
    fields: [
      {
        name: "invoiceNumber",
        label: "Invoice",
        type: "text",
        writable: true,
        required: true,
        sortable: true,
        filterable: true,
      },
      {
        name: "amount",
        label: "Amount",
        type: "currency",
        writable: true,
        sortable: true,
      },
      {
        name: "status",
        label: "Status",
        type: "enum",
        writable: true,
        filterable: true,
        enumValues: ["DRAFT", "PAID"],
      },
      {
        name: "description",
        label: "Description",
        type: "text",
        writable: true,
      },
    ],
    defaultSort: { field: "createdAt", dir: "desc" },
    searchFields: ["invoiceNumber"],
    statusField: "status",
    statusOptions: ["DRAFT", "PAID"],
    numericFields: ["amount"],
    dateFields: [],
    groupableFields: ["status"],
    supportedScopes: ["TENANT", "DEPARTMENT", "TEAM", "SELF"],
    readOnly: false,
    ...overrides,
  };
}
