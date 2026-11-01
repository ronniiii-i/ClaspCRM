import type { EntityFieldMeta, EntityMeta, TableColumnConfig } from "@/lib/workspace-types";
import { formatDate, formatDateTime, formatEnum } from "@/lib/format";

export interface FieldDefinition {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "currency"
    | "date"
    | "select"
    | "checkbox"
    | "email";
  required?: boolean;
  options?: string[];
  mapTo?: "column" | "customFields";
  placeholder?: string;
}

const READ_ONLY_NAMES = new Set([
  "id",
  "tenantId",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
  "departmentId",
  "userId",
  "assignedToId",
]);

/** Read a dotted path (`customer.company`) without throwing on nulls. */
export function getPath(
  source: unknown,
  path: string,
): unknown {
  if (!path) return undefined;
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, source);
}

export function fieldMetaFor(
  meta: EntityMeta | null | undefined,
  path: string,
): EntityFieldMeta | undefined {
  if (!meta) return undefined;
  return meta.fields.find((field) => field.name === path);
}

export function isCurrencyField(field?: EntityFieldMeta): boolean {
  return field?.type === "currency";
}

export function isDateField(field?: EntityFieldMeta): boolean {
  return field?.type === "date";
}

const CURRENCY_FORMAT = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const NUMBER_FORMAT = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

export function formatCurrencyValue(value: unknown): string {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? CURRENCY_FORMAT.format(numeric) : "—";
}

export function formatNumber(value: unknown): string {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? NUMBER_FORMAT.format(numeric) : "—";
}

/** Plain text for a cell, driven by the column or entity field metadata. */
export function formatCellText(
  value: unknown,
  options: {
    columnType?: string;
    field?: EntityFieldMeta;
  } = {},
): string {
  if (value === null || value === undefined || value === "") return "—";

  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((entry) => String(entry)).join(", ") : "—";
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const label = record.name ?? record.label ?? record.title ?? record.company;
    if (typeof label === "string" && label.length > 0) return label;
    return JSON.stringify(value);
  }

  const type = options.columnType ?? options.field?.type;

  if (type === "currency") return formatCurrencyValue(value);
  if (type === "number") return formatNumber(value);
  if (type === "date") return formatDate(String(value));
  if (type === "boolean") return value ? "Yes" : "No";
  if (typeof value === "boolean") return value ? "Yes" : "No";

  return String(value);
}

export function formatEnumLabel(value: unknown): string {
  if (value === null || value === undefined) return "—";
  return formatEnum(String(value));
}

export function formatTimestamp(value: unknown): string {
  return formatDateTime(value as string);
}

/** Fallback table columns when a module config has none. */
export function columnsFromMeta(
  meta: EntityMeta | null | undefined,
): TableColumnConfig[] {
  if (!meta) return [];
  return meta.fields
    .filter((field) => !field.relation)
    .slice(0, 6)
    .map((field) => ({
      field: field.name,
      label: field.label,
      type: field.type,
      sortable: field.sortable,
      filterable: field.filterable,
    }));
}

function formTypeFor(field: EntityFieldMeta): FieldDefinition["type"] | null {
  switch (field.type) {
    case "enum":
      return "select";
    case "boolean":
      return "checkbox";
    case "number":
      return "number";
    case "currency":
      return "currency";
    case "date":
      return "date";
    case "email":
      return "email";
    case "text":
      return field.name.toLowerCase().includes("description")
        ? "textarea"
        : "text";
    default:
      return null;
  }
}

/** Convert entity metadata into writable form fields. */
export function formFieldsFromMeta(
  meta: EntityMeta | null | undefined,
): FieldDefinition[] {
  if (!meta) return [];

  return meta.fields.flatMap((field) => {
    if (field.relation || field.readOnly || field.writable === false) return [];
    if (READ_ONLY_NAMES.has(field.name)) return [];

    const type = formTypeFor(field);
    if (!type) return [];

    return [
      {
        name: field.name,
        label: field.label,
        type,
        required: field.required,
        options: field.enumValues,
        mapTo: "column" as const,
      },
    ];
  });
}

/** Initial values for a create/edit dialog from an existing row. */
export function initialFormValues(
  fields: FieldDefinition[],
  record?: Record<string, unknown> | null,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const field of fields) {
    const raw = record ? getPath(record, field.name) : undefined;

    if (field.type === "checkbox") {
      values[field.name] = Boolean(raw);
    } else if (field.type === "date" && typeof raw === "string") {
      values[field.name] = raw.slice(0, 10);
    } else {
      values[field.name] = raw === null || raw === undefined ? "" : String(raw);
    }
  }

  return values;
}

/** Convert form strings back into the types the workspace API expects. */
export function prepareFormValues(
  fields: FieldDefinition[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const raw = values[field.name];

    if (field.type === "checkbox") {
      payload[field.name] = Boolean(raw);
      continue;
    }

    if (raw === undefined || raw === null || raw === "") continue;

    if (field.type === "number" || field.type === "currency") {
      payload[field.name] = Number(raw);
      continue;
    }

    payload[field.name] = String(raw);
  }

  return payload;
}

const TONE_CLASSES: Record<string, string> = {
  emerald:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  amber:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  violet:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  slate: "border-border bg-muted text-muted-foreground",
};

const STATUS_TONES: Record<string, keyof typeof TONE_CLASSES> = {
  paid: "emerald",
  won: "emerald",
  completed: "emerald",
  resolved: "emerald",
  active: "emerald",
  present: "emerald",
  published: "emerald",
  customer: "emerald",
  pending: "amber",
  proposal: "amber",
  negotiation: "amber",
  review: "violet",
  qualified: "blue",
  "in progress": "blue",
  "in_progress": "blue",
  open: "blue",
  prospect: "blue",
  lead: "slate",
  todo: "slate",
  draft: "slate",
  archived: "slate",
  overdue: "rose",
  cancelled: "rose",
  lost: "rose",
  absent: "rose",
  fired: "rose",
  suspended: "rose",
  closed: "slate",
};

export function badgeTone(value: unknown): string {
  const key = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  const tone = STATUS_TONES[key] ?? "slate";
  return TONE_CLASSES[tone];
}

/** Column label lookup with a humanised fallback. */
export function labelForField(
  meta: EntityMeta | null | undefined,
  path: string,
): string {
  return fieldMetaFor(meta, path)?.label ?? formatEnum(path);
}
