"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useModuleContext } from "./ModuleContext";
import type { ModuleRendererProps } from "./types";
import type {
  FormConfig,
  FormFieldConfig,
  SubmissionRecord,
} from "@/lib/workspace-types";
import { moduleLocation } from "@/lib/workspace-navigation";
import { FieldControl } from "./shared/FieldControl";
import { ErrorState } from "./shared/ErrorState";
import {
  formatCellText,
  formatTimestamp,
  type FieldDefinition,
} from "./shared/record-utils";
import { useSubmitForm, useSubmissions } from "@/hooks/workspace/useSubmissions";

function toFieldDefinition(field: FormFieldConfig): FieldDefinition {
  return {
    name: field.name,
    label: field.label,
    type: field.type,
    required: field.required,
    options: field.options,
    mapTo: field.mapTo,
  };
}

/**
 * Runtime schema for a configured form.
 *
 * It mirrors the backend's `validateValues` so a bad value is caught before
 * the request, but the backend remains authoritative.
 */
export function buildFormSchema(fields: FormFieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (field.type === "checkbox") {
      shape[field.name] = z.boolean().optional();
      continue;
    }

    let schema: z.ZodTypeAny = z.string();

    if (field.required) {
      schema = z.string().trim().min(1, `${field.label} is required.`);
    } else {
      schema = z.string().optional();
    }

    if (field.type === "number" || field.type === "currency") {
      schema = schema.refine(
        (value) =>
          value === undefined ||
          value === "" ||
          Number.isFinite(Number(value)),
        `${field.label} must be a number.`,
      );
    }

    if (field.type === "date") {
      schema = schema.refine(
        (value) =>
          value === undefined ||
          value === "" ||
          !Number.isNaN(new Date(String(value)).getTime()),
        `${field.label} must be a valid date.`,
      );
    }

    if (field.type === "email") {
      schema = schema.refine(
        (value) =>
          value === undefined ||
          value === "" ||
          /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value)),
        `${field.label} must be a valid email address.`,
      );
    }

    if (field.type === "select" && field.options?.length) {
      const allowed = field.options;
      schema = schema.refine(
        (value) =>
          value === undefined || value === "" || allowed.includes(String(value)),
        `${field.label} must be one of: ${allowed.join(", ")}.`,
      );
    }

    shape[field.name] = schema;
  }

  return z.object(shape);
}

/** Drop empty optional values and coerce numbers the way the API expects. */
export function toSubmissionPayload(
  fields: FormFieldConfig[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const raw = values[field.name];

    if (field.type === "checkbox") {
      if (raw !== undefined) payload[field.name] = Boolean(raw);
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

function emptyValues(fields: FormFieldConfig[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    values[field.name] = field.type === "checkbox" ? false : "";
  }
  return values;
}

function submissionSummary(
  submission: SubmissionRecord,
  fields: FormFieldConfig[],
): Array<{ label: string; value: unknown }> {
  return fields.slice(0, 4).map((field) => ({
    label: field.label,
    value: submission.data?.[field.name],
  }));
}

export function FormRenderer({ definition }: ModuleRendererProps) {
  const { can, entityMeta } = useModuleContext();
  const config = definition.config as FormConfig;
  const { deptKey, moduleKey } = moduleLocation(definition);

  const fields = useMemo(() => config.fields ?? [], [config.fields]);
  const defaults = useMemo(() => emptyValues(fields), [fields]);
  const schema = useMemo(() => buildFormSchema(fields), [fields]);

  const canSubmit = can("CREATE") && fields.length > 0;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Record<string, unknown>>({ defaultValues: defaults });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const { mutate, isPending, error: submitError } = useSubmitForm(
    deptKey,
    moduleKey,
  );

  const submissions = useSubmissions(deptKey, moduleKey, {
    enabled: can("VIEW"),
  });

  const submit = handleSubmit((values) => {
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const name = issue.path[0];
        if (typeof name === "string") {
          setError(name, { type: "validate", message: issue.message });
        }
      }
      return;
    }

    mutate(toSubmissionPayload(fields, parsed.data as Record<string, unknown>), {
      onSuccess: () => {
        toast.success(config.successMessage || "Form submitted.");
        reset(defaults);
      },
      onError: (mutationError) => toast.error(mutationError.message),
    });
  });

  const rows = submissions.data?.data ?? [];

  return (
    <section className="flex flex-col gap-6" aria-label={definition.name}>
      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          This form has no fields configured yet.
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <Controller
                key={field.name}
                name={field.name}
                control={control}
                render={({ field: controlField }) => (
                  <FieldControl
                    field={toFieldDefinition(field)}
                    value={controlField.value}
                    onChange={controlField.onChange}
                    onBlur={controlField.onBlur}
                    error={errors[field.name]?.message as string | undefined}
                    disabled={!canSubmit || isPending}
                  />
                )}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <Button type="submit" disabled={!canSubmit || isPending}>
              <Send aria-hidden="true" />
              {isPending ? "Submitting…" : config.submitLabel || "Submit"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => reset(defaults)}
            >
              Reset
            </Button>
            {!can("CREATE") ? (
              <span className="text-xs text-muted-foreground">
                You do not have permission to submit this form.
              </span>
            ) : null}
            {submitError ? (
              <span role="alert" className="text-xs text-destructive">
                {submitError.message}
              </span>
            ) : null}
          </div>
        </form>
      )}

      {can("VIEW") ? (
        <section className="flex flex-col gap-3" aria-label="Recent submissions">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Recent submissions</h2>
            {submissions.data?.meta ? (
              <span className="text-xs text-muted-foreground">
                {submissions.data.meta.total} total
              </span>
            ) : null}
          </div>

          {submissions.isError ? (
            <ErrorState
              title="Could not load submissions"
              message={submissions.error.message}
              onRetry={() => void submissions.refetch()}
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableHead>By</TableHead>
                    {fields.slice(0, 4).map((field) => (
                      <TableHead key={field.name}>{field.label}</TableHead>
                    ))}
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.isPending ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={`submission-skeleton-${index}`}>
                        <TableCell colSpan={fields.slice(0, 4).length + 3}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={fields.slice(0, 4).length + 3}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        No submissions yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="whitespace-nowrap tabular-nums">
                          {formatTimestamp(submission.createdAt)}
                        </TableCell>
                        <TableCell>
                          {submission.submittedBy?.name ??
                            submission.submittedById.slice(0, 8)}
                        </TableCell>
                        {submissionSummary(submission, fields).map((entry) => (
                          <TableCell key={entry.label}>
                            {formatCellText(entry.value)}
                          </TableCell>
                        ))}
                        <TableCell>{submission.status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      ) : null}

      {fields.length > 0 && !entityMeta ? (
        <p className="text-xs text-muted-foreground">
          Fields are defined by this module&apos;s form configuration.
          {fields.some((field) => field.mapTo === "customFields")
            ? " Custom-field values are stored on the record."
            : ""}
        </p>
      ) : null}
    </section>
  );
}
