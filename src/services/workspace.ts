import { apiRequest } from "./api-client";
import type {
  AggregateResponse,
  AggregateWidgetResult,
  DocumentInput,
  DocumentListQuery,
  DocumentPage,
  DocumentRecord,
  ModuleDefinition,
  RecordFilter,
  RecordsPage,
  RecordsQuery,
  SubmissionPage,
  SubmissionResult,
  WorkspaceRecord,
} from "@/lib/workspace-types";

/**
 * Typed workspace API client.
 *
 * Every path is module-scoped; the backend resolves the entity allowlist,
 * data scope and permissions from the module, never from the query string.
 */

function modulePath(deptKey: string, moduleKey: string, suffix = ""): string {
  return `/workspace/modules/${encodeURIComponent(deptKey)}/${encodeURIComponent(
    moduleKey,
  )}${suffix}`;
}

function appendFilter(params: URLSearchParams, filter: RecordFilter): void {
  const key =
    filter.op && filter.op !== "eq"
      ? `filter[${filter.field}][${filter.op}]`
      : `filter[${filter.field}]`;

  const value = filter.value;
  if (Array.isArray(value)) {
    params.set(key, value.map((entry) => String(entry)).join(","));
    return;
  }
  if (value === undefined || value === null) return;
  params.set(key, String(value));
}

/** Serialise a records query into the backend's bounded query contract. */
export function buildRecordsSearchParams(query: RecordsQuery = {}): string {
  const params = new URLSearchParams();

  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.sort?.field) {
    params.set("sort", `${query.sort.field}:${query.sort.dir ?? "desc"}`);
  }
  if (query.include?.length) params.set("include", query.include.join(","));

  for (const filter of query.filters ?? []) appendFilter(params, filter);

  return params.toString();
}

function withQuery(path: string, params: string): string {
  return params ? `${path}?${params}` : path;
}

export const WorkspaceService = {
  getModuleDefinition(
    deptKey: string,
    moduleKey: string,
  ): Promise<ModuleDefinition> {
    return apiRequest<ModuleDefinition>(modulePath(deptKey, moduleKey), {
      errorMessage: "Failed to load module",
    });
  },

  // Records ---------------------------------------------------------------

  listRecords<Row = WorkspaceRecord>(
    deptKey: string,
    moduleKey: string,
    query: RecordsQuery = {},
  ): Promise<RecordsPage<Row>> {
    return apiRequest<RecordsPage<Row>>(
      withQuery(
        modulePath(deptKey, moduleKey, "/records"),
        buildRecordsSearchParams(query),
      ),
      { errorMessage: "Failed to load records" },
    );
  },

  getRecord<Row = WorkspaceRecord>(
    deptKey: string,
    moduleKey: string,
    id: string,
  ): Promise<Row> {
    return apiRequest<Row>(
      modulePath(deptKey, moduleKey, `/records/${encodeURIComponent(id)}`),
      { errorMessage: "Failed to load record" },
    );
  },

  createRecord<Row = WorkspaceRecord>(
    deptKey: string,
    moduleKey: string,
    body: Record<string, unknown>,
  ): Promise<Row> {
    return apiRequest<Row>(modulePath(deptKey, moduleKey, "/records"), {
      method: "POST",
      body: JSON.stringify(body),
      errorMessage: "Failed to create record",
    });
  },

  updateRecord<Row = WorkspaceRecord>(
    deptKey: string,
    moduleKey: string,
    id: string,
    body: Record<string, unknown>,
  ): Promise<Row> {
    return apiRequest<Row>(
      modulePath(deptKey, moduleKey, `/records/${encodeURIComponent(id)}`),
      {
        method: "PATCH",
        body: JSON.stringify(body),
        errorMessage: "Failed to update record",
      },
    );
  },

  deleteRecord(
    deptKey: string,
    moduleKey: string,
    id: string,
  ): Promise<{ id: string; deleted: true }> {
    return apiRequest<{ id: string; deleted: true }>(
      modulePath(deptKey, moduleKey, `/records/${encodeURIComponent(id)}`),
      { method: "DELETE", errorMessage: "Failed to delete record" },
    );
  },

  transitionRecord<Row = WorkspaceRecord>(
    deptKey: string,
    moduleKey: string,
    id: string,
    status: string,
  ): Promise<Row> {
    return apiRequest<Row>(
      modulePath(
        deptKey,
        moduleKey,
        `/records/${encodeURIComponent(id)}/transition`,
      ),
      {
        method: "POST",
        body: JSON.stringify({ status }),
        errorMessage: "Failed to move record",
      },
    );
  },

  // Aggregates ------------------------------------------------------------

  aggregate(
    deptKey: string,
    moduleKey: string,
    widgets: Array<Record<string, unknown>>,
  ): Promise<AggregateResponse> {
    return apiRequest<AggregateResponse>(
      modulePath(deptKey, moduleKey, "/aggregate"),
      {
        method: "POST",
        body: JSON.stringify({ widgets }),
        errorMessage: "Failed to load dashboard",
      },
    );
  },

  runWidget(
    deptKey: string,
    moduleKey: string,
    widget: Record<string, unknown>,
  ): Promise<AggregateWidgetResult> {
    return WorkspaceService.aggregate(deptKey, moduleKey, [widget]).then(
      (response) =>
        response.results[0] ?? {
          id: String(widget.id ?? "widget"),
          error: { code: "EMPTY_RESULT", message: "No result returned." },
        },
    );
  },

  updateConfig(
    deptKey: string,
    moduleKey: string,
    config: Record<string, unknown>,
  ): Promise<{ config: Record<string, unknown> }> {
    return apiRequest<{ config: Record<string, unknown> }>(
      modulePath(deptKey, moduleKey, "/config"),
      {
        method: "PATCH",
        body: JSON.stringify(config),
        errorMessage: "Failed to save configuration",
      },
    );
  },

  // Documents -------------------------------------------------------------

  listDocuments(
    deptKey: string,
    moduleKey: string,
    query: DocumentListQuery = {},
  ): Promise<DocumentPage> {
    const params = new URLSearchParams();
    if (query.search?.trim()) params.set("search", query.search.trim());
    if (query.category) params.set("category", query.category);
    if (query.status) params.set("status", query.status);
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.pageSize) params.set("pageSize", String(query.pageSize));

    return apiRequest<DocumentPage>(
      withQuery(
        modulePath(deptKey, moduleKey, "/documents"),
        params.toString(),
      ),
      { errorMessage: "Failed to load documents" },
    );
  },

  getDocument(
    deptKey: string,
    moduleKey: string,
    id: string,
  ): Promise<DocumentRecord> {
    return apiRequest<DocumentRecord>(
      modulePath(deptKey, moduleKey, `/documents/${encodeURIComponent(id)}`),
      { errorMessage: "Failed to load document" },
    );
  },

  createDocument(
    deptKey: string,
    moduleKey: string,
    input: DocumentInput,
  ): Promise<DocumentRecord> {
    return apiRequest<DocumentRecord>(
      modulePath(deptKey, moduleKey, "/documents"),
      {
        method: "POST",
        body: JSON.stringify(input),
        errorMessage: "Failed to create document",
      },
    );
  },

  updateDocument(
    deptKey: string,
    moduleKey: string,
    id: string,
    input: DocumentInput,
  ): Promise<DocumentRecord> {
    return apiRequest<DocumentRecord>(
      modulePath(deptKey, moduleKey, `/documents/${encodeURIComponent(id)}`),
      {
        method: "PATCH",
        body: JSON.stringify(input),
        errorMessage: "Failed to save document",
      },
    );
  },

  deleteDocument(
    deptKey: string,
    moduleKey: string,
    id: string,
    hard = false,
  ): Promise<{ id: string; archived: boolean; deleted: boolean }> {
    return apiRequest<{ id: string; archived: boolean; deleted: boolean }>(
      modulePath(
        deptKey,
        moduleKey,
        `/documents/${encodeURIComponent(id)}${hard ? "?hard=true" : ""}`,
      ),
      { method: "DELETE", errorMessage: "Failed to delete document" },
    );
  },

  // Form submissions ------------------------------------------------------

  listSubmissions(
    deptKey: string,
    moduleKey: string,
    query: { page?: number; pageSize?: number } = {},
  ): Promise<SubmissionPage> {
    const params = new URLSearchParams();
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.pageSize) params.set("pageSize", String(query.pageSize));

    return apiRequest<SubmissionPage>(
      withQuery(
        modulePath(deptKey, moduleKey, "/submissions"),
        params.toString(),
      ),
      { errorMessage: "Failed to load submissions" },
    );
  },

  submitForm(
    deptKey: string,
    moduleKey: string,
    data: Record<string, unknown>,
  ): Promise<SubmissionResult> {
    return apiRequest<SubmissionResult>(
      modulePath(deptKey, moduleKey, "/submissions"),
      {
        method: "POST",
        body: JSON.stringify({ data }),
        errorMessage: "Failed to submit form",
      },
    );
  },
};
