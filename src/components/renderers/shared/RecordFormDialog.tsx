"use client";

import { useEffect, useId, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FieldControl } from "./FieldControl";
import {
  initialFormValues,
  prepareFormValues,
  type FieldDefinition,
} from "./record-utils";

interface RecordFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: FieldDefinition[];
  initialValues?: Record<string, unknown>;
  submitLabel?: string;
  busy?: boolean;
  error?: string | null;
  onSubmit: (values: Record<string, unknown>) => void;
}

/** Runtime Zod schema for a renderer form. */
export function buildFieldSchema(fields: FieldDefinition[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (field.type === "checkbox") {
      shape[field.name] = z.boolean().optional();
      continue;
    }

    let schema: z.ZodTypeAny = z.string();

    if (field.required) {
      schema = z
        .string()
        .trim()
        .min(1, `${field.label} is required.`);
    } else {
      schema = z.string().optional();
    }

    if (field.type === "number" || field.type === "currency") {
      schema = schema.refine(
        (value) =>
          value === undefined || value === "" || Number.isFinite(Number(value)),
        `${field.label} must be a number.`,
      );
    }

    if (field.type === "email") {
      schema = schema.refine(
        (value) =>
          value === undefined ||
          value === "" ||
          /^[^@\s]+@[^@\s]+$/.test(String(value)),
        `${field.label} must be a valid email.`,
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

/**
 * Modal form shared by the DataTable create/edit flows, the Kanban card
 * editor and any renderer that needs the entity field set.
 */
export function RecordFormDialog({
  open,
  onClose,
  title,
  description,
  fields,
  initialValues,
  submitLabel = "Save",
  busy = false,
  error,
  onSubmit,
}: RecordFormDialogProps) {
  const formId = useId();
  const schema = useMemo(() => buildFieldSchema(fields), [fields]);
  const defaults = useMemo(
    () => initialValues ?? initialFormValues(fields),
    [fields, initialValues],
  );

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Record<string, unknown>>({
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

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

    onSubmit(prepareFormValues(fields, parsed.data as Record<string, unknown>));
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      className="max-w-xl"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={busy}>
            {busy ? "Saving…" : submitLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
          {fields.map((field) => (
            <Controller
              key={field.name}
              name={field.name}
              control={control}
              render={({ field: controlField }) => (
                <FieldControl
                  field={field}
                  value={controlField.value}
                  onChange={controlField.onChange}
                  onBlur={controlField.onBlur}
                  error={errors[field.name]?.message as string | undefined}
                  disabled={busy}
                />
              )}
            />
          ))}
        </div>

        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This module has no writable fields.
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
