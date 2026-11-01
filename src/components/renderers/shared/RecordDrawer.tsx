"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { EntityMeta, WorkspaceRecord } from "@/lib/workspace-types";
import { CellValue } from "./CellValue";
import { formatTimestamp, getPath } from "./record-utils";

/**
 * Read-only record drawer.
 *
 * Shows every allowlisted entity field plus any `customFields` entries stored
 * on the row. Custom fields are authored through the Form renderer and are not
 * first-class columns, so they are rendered separately.
 */
export function RecordDrawer({
  open,
  onClose,
  title,
  record,
  meta,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  record: WorkspaceRecord | null;
  meta: EntityMeta | null;
  onEdit?: () => void;
}) {
  const fields = meta?.fields.filter((field) => !field.relation) ?? [];
  const customFields =
    record?.customFields &&
    typeof record.customFields === "object" &&
    !Array.isArray(record.customFields)
      ? (record.customFields as Record<string, unknown>)
      : {};

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={
        record ? `Record ${String(record.id).slice(0, 8)}` : undefined
      }
      className="max-w-2xl"
      footer={
        <>
          {onEdit ? (
            <Button variant="outline" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
          <Button onClick={onClose}>Close</Button>
        </>
      }
    >
      {record ? (
        <div className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="text-sm">
                  <CellValue
                    value={getPath(record, field.name)}
                    field={field}
                  />
                </dd>
              </div>
            ))}
          </dl>

          {Object.keys(customFields).length > 0 ? (
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <h3 className="text-sm font-semibold">Custom fields</h3>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {Object.entries(customFields).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {key}
                    </dt>
                    <dd className="text-sm">
                      <CellValue value={value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 text-xs text-muted-foreground sm:grid-cols-2">
            <span>Created {formatTimestamp(record.createdAt)}</span>
            <span>Updated {formatTimestamp(record.updatedAt)}</span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
