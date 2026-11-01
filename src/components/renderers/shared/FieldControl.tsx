"use client";

import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FieldDefinition } from "./record-utils";

interface FieldControlProps {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  id?: string;
}

/** One form control driven by a renderer field definition. */
export function FieldControl({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  id,
}: FieldControlProps) {
  const inputId = id ?? `field-${field.name}`;
  const describedBy = error ? `${inputId}-error` : undefined;

  if (field.type === "checkbox") {
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Checkbox
            id={inputId}
            checked={Boolean(value)}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange(event.target.checked)
            }
            onBlur={onBlur}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
          />
          {field.label}
        </label>
        {error ? (
          <p id={describedBy} className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>
        {field.label}
        {field.required ? (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>

      {field.type === "textarea" ? (
        <Textarea
          id={inputId}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={field.placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          rows={4}
        />
      ) : field.type === "select" ? (
        <Select
          id={inputId}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        >
          <option value="">Select…</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      ) : (
        <Input
          id={inputId}
          type={
            field.type === "number" || field.type === "currency"
              ? "number"
              : field.type === "date"
                ? "date"
                : field.type === "email"
                  ? "email"
                  : "text"
          }
          step={
            field.type === "currency"
              ? "0.01"
              : field.type === "number"
                ? "any"
                : undefined
          }
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={field.placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(field.type === "currency" && "font-mono")}
        />
      )}

      {error ? (
        <p id={describedBy} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
