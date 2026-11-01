"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useWorkspaceRecordMutations,
  useWorkspaceRecords,
} from "@/hooks/workspace/useWorkspaceRecords";
import { useModuleContext } from "./ModuleContext";
import type { ModuleRendererProps } from "./types";
import type {
  FilterOperator,
  RecordFilter,
  TableConfig,
  TableFilterConfig,
  WorkspaceRecord,
} from "@/lib/workspace-types";
import { moduleLocation } from "@/lib/workspace-navigation";
import { CellValue } from "./shared/CellValue";
import { ErrorState } from "./shared/ErrorState";
import { RecordDrawer } from "./shared/RecordDrawer";
import { RecordFormDialog } from "./shared/RecordFormDialog";
import {
  columnsFromMeta,
  fieldMetaFor,
  formFieldsFromMeta,
  getPath,
  initialFormValues,
} from "./shared/record-utils";

interface FilterState {
  field: string;
  value: string;
}

function filterOptions(
  filter: TableFilterConfig,
  enumValues?: string[],
): string[] {
  if (enumValues?.length) return enumValues;
  return filter.options ?? [];
}

export function DataTableRenderer({ definition }: ModuleRendererProps) {
  const { can, entityMeta } = useModuleContext();
  const config = definition.config as TableConfig;
  const { deptKey, moduleKey } = moduleLocation(definition);

  const columns = useMemo(
    () =>
      config.columns.length > 0 ? config.columns : columnsFromMeta(entityMeta),
    [config.columns, entityMeta],
  );

  const filterDefs = useMemo<TableFilterConfig[]>(() => {
    if (config.filters.length > 0) return config.filters;
    return (
      entityMeta?.fields
        .filter((field) => field.filterable && field.enumValues?.length)
        .slice(0, 3)
        .map((field) => ({ field: field.name, label: field.label })) ?? []
    );
  }, [config.filters, entityMeta]);

  const searchable =
    config.searchFields.length > 0 || (entityMeta?.searchFields.length ?? 0) > 0;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(config.defaultSort);
  const [filters, setFilters] = useState<FilterState[]>([]);
  const [detail, setDetail] = useState<WorkspaceRecord | null>(null);
  const [editing, setEditing] = useState<WorkspaceRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceRecord | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryFilters: RecordFilter[] = useMemo(
    () =>
      filters
        .filter((filter) => filter.value !== "")
        .map((filter) => ({
          field: filter.field,
          op: "eq" as FilterOperator,
          value: filter.value,
        })),
    [filters],
  );

  const records = useWorkspaceRecords(deptKey, moduleKey, {
    search: search || undefined,
    page,
    pageSize: config.pageSize || 25,
    sort,
    filters: queryFilters,
  });

  const { create, update, remove } = useWorkspaceRecordMutations(
    deptKey,
    moduleKey,
  );

  const fields = useMemo(() => formFieldsFromMeta(entityMeta), [entityMeta]);
  const readOnly = entityMeta?.readOnly === true;
  const canCreate =
    can("CREATE") && config.createEnabled && Boolean(config.entity) && !readOnly;
  const canEdit = can("EDIT") && !readOnly;
  const canDelete = can("DELETE") && !readOnly;

  const initialValues = useMemo(
    () =>
      editing ? initialFormValues(fields, editing) : initialFormValues(fields),
    [editing, fields],
  );

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (row: WorkspaceRecord) => {
    setDetail(null);
    setEditing(row);
    setDialogOpen(true);
  };

  const submitForm = (values: Record<string, unknown>) => {
    if (editing) {
      update.mutate(
        { id: editing.id, body: values },
        {
          onSuccess: () => {
            toast.success("Record updated.");
            setDialogOpen(false);
            setEditing(null);
          },
          onError: (error) => toast.error(error.message),
        },
      );
      return;
    }

    create.mutate(values, {
      onSuccess: () => {
        toast.success("Record created.");
        setDialogOpen(false);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    remove.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Record deleted.");
        setDeleteTarget(null);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const changeFilter = (field: string, value: string) => {
    setPage(1);
    setFilters((current) => {
      const next = current.filter((entry) => entry.field !== field);
      return value ? [...next, { field, value }] : next;
    });
  };

  const toggleSort = (field: string) => {
    setPage(1);
    setSort((current) =>
      current?.field === field
        ? { field, dir: current.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );
  };

  const rows = records.data?.data ?? [];
  const meta = records.data?.meta;

  if (records.isError) {
    return (
      <ErrorState
        title="Could not load records"
        message={records.error.message}
        onRetry={() => void records.refetch()}
      />
    );
  }

  return (
    <section className="flex flex-col gap-4" aria-label={definition.name}>
      <div className="flex flex-wrap items-center gap-2">
        {searchable ? (
          <div className="relative min-w-56 flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search records…"
              aria-label="Search records"
              className="pl-8"
            />
          </div>
        ) : null}

        {filterDefs.map((filter) => {
          const enumValues = entityMeta?.fields.find(
            (field) => field.name === filter.field,
          )?.enumValues;
          const options = filterOptions(filter, enumValues);
          const value =
            filters.find((entry) => entry.field === filter.field)?.value ?? "";

          return (
            <Select
              key={filter.field}
              value={value}
              onChange={(event) =>
                changeFilter(filter.field, event.target.value)
              }
              aria-label={`Filter by ${filter.label}`}
              className="w-auto min-w-36"
            >
              <option value="">All {filter.label.toLowerCase()}</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          {meta ? (
            <span className="text-xs text-muted-foreground">
              {meta.total} record{meta.total === 1 ? "" : "s"}
            </span>
          ) : null}
          {canCreate ? (
            <Button size="sm" onClick={openCreate}>
              <Plus aria-hidden="true" />
              New record
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                const active = sort?.field === column.field;
                return (
                  <TableHead
                    key={column.field}
                    style={column.width ? { width: column.width } : undefined}
                    aria-sort={
                      active
                        ? sort?.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.field)}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {column.label}
                        {active ? (
                          sort?.dir === "asc" ? (
                            <ArrowUp className="size-3" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="size-3" aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown
                            className="size-3 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                );
              })}
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.isPending ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <TableCell key={column.field}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Skeleton className="ml-auto h-4 w-12" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No records match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={column.field}>
                      <CellValue
                        value={getPath(row, column.field)}
                        columnType={column.type}
                        field={fieldMetaFor(entityMeta, column.field)}
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`View ${columnTitle(row, columns)}`}
                        onClick={() => setDetail(row)}
                      >
                        <Eye aria-hidden="true" />
                      </Button>
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${columnTitle(row, columns)}`}
                          onClick={() => openEdit(row)}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${columnTitle(row, columns)}`}
                          onClick={() => setDeleteTarget(row)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {meta
            ? `Page ${meta.page} of ${meta.totalPages}`
            : records.isPending
              ? "Loading…"
              : ""}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!meta || meta.page <= 1 || records.isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!meta || meta.page >= meta.totalPages || records.isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <RecordDrawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? columnTitle(detail, columns) : definition.name}
        record={detail}
        meta={entityMeta}
        onEdit={canEdit && detail ? () => openEdit(detail) : undefined}
      />

      <RecordFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit record" : "New record"}
        description={`${definition.name} · ${entityMeta?.label ?? config.entity ?? ""}`}
        fields={fields}
        initialValues={initialValues}
        submitLabel={editing ? "Save changes" : "Create record"}
        busy={create.isPending || update.isPending}
        error={
          (create.error as Error | null)?.message ??
          (update.error as Error | null)?.message ??
          null
        }
        onSubmit={submitForm}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete record"
        description="This action cannot be undone."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={remove.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={remove.isPending}
            >
              {remove.isPending ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Delete{" "}
          <span className="font-medium text-foreground">
            {deleteTarget ? columnTitle(deleteTarget, columns) : "this record"}
          </span>
          ?
        </p>
      </Modal>
    </section>
  );
}

/** First non-id column value, used for accessible action labels. */
function columnTitle(
  row: WorkspaceRecord,
  columns: Array<{ field: string; label: string }>,
): string {
  const first = columns[0];
  const value = first ? getPath(row, first.field) : undefined;
  if (typeof value === "string" || typeof value === "number") return String(value);
  return `record ${String(row.id).slice(0, 8)}`;
}
