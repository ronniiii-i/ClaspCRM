"use client";

import { useMemo, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { GripVertical, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWorkspaceRecordMutations,
  useWorkspaceRecords,
} from "@/hooks/workspace/useWorkspaceRecords";
import { useModuleContext } from "./ModuleContext";
import type { ModuleRendererProps } from "./types";
import type {
  KanbanColumnConfig,
  KanbanConfig,
  WorkspaceRecord,
} from "@/lib/workspace-types";
import { moduleLocation } from "@/lib/workspace-navigation";
import { cn } from "@/lib/utils";
import { CellValue } from "./shared/CellValue";
import { ErrorState } from "./shared/ErrorState";
import { RecordFormDialog } from "./shared/RecordFormDialog";
import {
  fieldMetaFor,
  formFieldsFromMeta,
  formatCellText,
  getPath,
  initialFormValues,
} from "./shared/record-utils";

const COLUMN_TONES: Record<string, string> = {
  slate: "border-t-slate-400",
  blue: "border-t-blue-500",
  violet: "border-t-violet-500",
  emerald: "border-t-emerald-500",
  amber: "border-t-amber-500",
  rose: "border-t-rose-500",
};

function columnTone(color: string | undefined): string {
  return COLUMN_TONES[color ?? ""] ?? "border-t-border";
}

function cardTitle(
  row: WorkspaceRecord,
  config: KanbanConfig,
  fallback: string,
): string {
  const value = getPath(row, config.titleField);
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return `${fallback} ${String(row.id).slice(0, 8)}`;
}

function CardField({
  row,
  field,
  currency,
}: {
  row: WorkspaceRecord;
  field: string;
  currency?: boolean;
}) {
  const value = getPath(row, field);
  if (value === null || value === undefined || value === "") return null;

  return (
    <span className="text-xs text-muted-foreground">
      {formatCellText(value, { columnType: currency ? "currency" : undefined })}
    </span>
  );
}

export function KanbanRenderer({ definition }: ModuleRendererProps) {
  const { can, entityMeta } = useModuleContext();
  const config = definition.config as KanbanConfig;
  const { deptKey, moduleKey } = moduleLocation(definition);

  const columns = useMemo(
    () => config.columns ?? [],
    [config.columns],
  );

  const records = useWorkspaceRecords(deptKey, moduleKey, {
    page: 1,
    pageSize: 100,
  });

  const { transition, create, update } = useWorkspaceRecordMutations(
    deptKey,
    moduleKey,
    config.statusField,
  );

  const fields = useMemo(() => formFieldsFromMeta(entityMeta), [entityMeta]);
  const canMove = can("EDIT") && config.allowMove;
  const canCreate = can("CREATE") && config.allowCreate;
  const readOnly = entityMeta?.readOnly === true;

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WorkspaceRecord | null>(null);
  const [createStatus, setCreateStatus] = useState<string | null>(null);

  const rows = useMemo(() => records.data?.data ?? [], [records.data]);
  const meta = records.data?.meta;

  const grouped = useMemo(() => {
    const map = new Map<string, WorkspaceRecord[]>();
    for (const column of columns) map.set(column.value, []);
    for (const row of rows) {
      const status = String(getPath(row, config.statusField) ?? "");
      const bucket = map.get(status);
      if (bucket) bucket.push(row);
      else map.set(status, [...(map.get(status) ?? []), row]);
    }
    return map;
  }, [columns, rows, config.statusField]);

  const openCreate = (status: string | null) => {
    setEditing(null);
    setCreateStatus(status);
    setDialogOpen(true);
  };

  const openEdit = (row: WorkspaceRecord) => {
    setEditing(row);
    setCreateStatus(null);
    setDialogOpen(true);
  };

  const move = (row: WorkspaceRecord, status: string) => {
    if (String(getPath(row, config.statusField) ?? "") === status) return;
    if (!canMove) return;

    transition.mutate(
      { id: row.id, status },
      {
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const onDragStart = (event: DragEvent<HTMLElement>, row: WorkspaceRecord) => {
    if (!canMove) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("text/plain", row.id);
    event.dataTransfer.effectAllowed = "move";
    setDraggingId(row.id);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setDragOver(null);
  };

  const onDrop = (event: DragEvent<HTMLElement>, column: KanbanColumnConfig) => {
    event.preventDefault();
    setDragOver(null);
    setDraggingId(null);

    const id = event.dataTransfer.getData("text/plain");
    const row = rows.find((entry) => entry.id === id);
    if (row) move(row, column.value);
  };

  const initialValues = useMemo(() => {
    if (editing) return initialFormValues(fields, editing);
    const values = initialFormValues(fields);
    if (createStatus) values[config.statusField] = createStatus;
    return values;
  }, [editing, fields, createStatus, config.statusField]);

  const submitForm = (values: Record<string, unknown>) => {
    const onSuccess = () => {
      toast.success(editing ? "Card updated." : "Card created.");
      setDialogOpen(false);
      setEditing(null);
      setCreateStatus(null);
    };
    const onError = (error: Error) => toast.error(error.message);

    if (editing) {
      update.mutate({ id: editing.id, body: values }, { onSuccess, onError });
      return;
    }

    create.mutate(values, { onSuccess, onError });
  };

  if (records.isError) {
    return (
      <ErrorState
        title="Could not load the board"
        message={records.error.message}
        onRetry={() => void records.refetch()}
      />
    );
  }

  const renderCard = (row: WorkspaceRecord) => {
    const title = cardTitle(row, config, definition.name);
    const value = config.valueField ? getPath(row, config.valueField) : null;
    const assignee = config.assigneeField
      ? getPath(row, config.assigneeField)
      : null;
    const due = config.dueField ? getPath(row, config.dueField) : null;

    return (
      <article
        key={row.id}
        draggable={canMove}
        onDragStart={(event) => onDragStart(event, row)}
        onDragEnd={onDragEnd}
        aria-roledescription={canMove ? "draggable card" : undefined}
        className={cn(
          "flex flex-col gap-2 rounded-md border border-border bg-background p-3 shadow-xs",
          canMove && "cursor-grab active:cursor-grabbing",
          draggingId === row.id && "opacity-50",
        )}
      >
        <div className="flex items-start gap-1">
          {canMove ? (
            <GripVertical
              className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          ) : null}
          <h3 className="flex-1 text-sm font-medium leading-5">{title}</h3>
          {can("EDIT") && !readOnly ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              aria-label={`Edit ${title}`}
              onClick={() => openEdit(row)}
            >
              <Pencil aria-hidden="true" />
            </Button>
          ) : null}
        </div>

        {value !== null && value !== undefined && value !== "" ? (
          <span className="text-sm font-semibold tabular-nums">
            {formatCellText(value, {
              columnType: fieldMetaFor(entityMeta, config.valueField ?? "")?.type,
            })}
          </span>
        ) : null}

        {(config.secondaryColumns ?? []).map((column) => (
          <CardField
            key={column.value}
            row={row}
            field={column.value}
            currency={fieldMetaFor(entityMeta, column.value)?.type === "currency"}
          />
        ))}

        {assignee !== null && assignee !== undefined && assignee !== "" ? (
          <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <span className="sr-only">Assignee</span>
            <CellValue
              value={assignee}
              field={fieldMetaFor(entityMeta, config.assigneeField ?? "")}
            />
          </div>
        ) : null}

        {due !== null && due !== undefined && due !== "" ? (
          <CardField row={row} field={config.dueField as string} />
        ) : null}

        {canMove ? (
          <label className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span className="sr-only">Move {title} to</span>
            <Select
              className="h-7 py-0 text-xs"
              aria-label={`Move ${title} to another column`}
              value={String(getPath(row, config.statusField) ?? "")}
              onChange={(event) => move(row, event.target.value)}
            >
              {columns.map((column) => (
                <option key={column.value} value={column.value}>
                  {column.label}
                </option>
              ))}
            </Select>
          </label>
        ) : null}
      </article>
    );
  };

  return (
    <section className="flex flex-col gap-4" aria-label={definition.name}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{rows.length} cards</Badge>
          {meta ? <span>{meta.total} total</span> : null}
          {canMove ? <span>Drag a card or use its move menu.</span> : null}
        </div>
        {canCreate && !readOnly ? (
          <Button size="sm" onClick={() => openCreate(null)}>
            <Plus aria-hidden="true" />
            New card
          </Button>
        ) : null}
      </div>

      {records.isPending ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => (
            <div
              key={column.value}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3"
            >
              <Skeleton className="h-5 w-28" />
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columns.map((column) => {
            const cards = grouped.get(column.value) ?? [];
            return (
              <div
                key={column.value}
                onDragOver={(event) => {
                  if (!canMove) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDragOver(column.value);
                }}
                onDragLeave={() =>
                  setDragOver((current) =>
                    current === column.value ? null : current,
                  )
                }
                onDrop={(event) => onDrop(event, column)}
                aria-label={`${column.label} column`}
                className={cn(
                  "flex min-w-64 flex-1 flex-col gap-3 rounded-lg border border-t-4 border-border bg-card p-3",
                  columnTone(column.color),
                  dragOver === column.value && "bg-muted/60 ring-2 ring-ring/40",
                )}
              >
                <header className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">{column.label}</h2>
                  <Badge variant="outline">{cards.length}</Badge>
                </header>

                <div className="flex flex-col gap-2">
                  {cards.length === 0 ? (
                    <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                      Drop a card here.
                    </p>
                  ) : (
                    cards.map(renderCard)
                  )}
                </div>

                {canCreate && !readOnly ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-muted-foreground"
                    onClick={() => openCreate(column.value)}
                  >
                    <Plus aria-hidden="true" />
                    Add card
                  </Button>
                ) : null}
              </div>
            );
          })}

          {columns.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
              This board has no columns configured.
            </p>
          ) : null}
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <p className="text-xs text-muted-foreground">
          Showing the first {meta.pageSize} of {meta.total} records.
        </p>
      ) : null}

      <RecordFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
          setCreateStatus(null);
        }}
        title={editing ? "Edit card" : "New card"}
        description={definition.name}
        fields={fields}
        initialValues={initialValues}
        submitLabel={editing ? "Save changes" : "Create card"}
        busy={create.isPending || update.isPending}
        error={
          (create.error as Error | null)?.message ??
          (update.error as Error | null)?.message ??
          null
        }
        onSubmit={submitForm}
      />
    </section>
  );
}
