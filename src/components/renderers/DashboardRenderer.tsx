"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from "recharts";
import { Pencil, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardAggregate, useUpdateModuleConfig } from "@/hooks/workspace/useWorkspaceAggregate";
import { isTenantAdminRole } from "@/lib/format";
import { moduleLocation } from "@/lib/workspace-navigation";
import { useModuleContext } from "./ModuleContext";
import type { ModuleRendererProps } from "./types";
import type {
  AggregateWidgetResult,
  AggregationKind,
  DashboardConfig,
  DashboardWidget,
  Timeframe,
  WidgetKind,
} from "@/lib/workspace-types";
import { cn } from "@/lib/utils";
import { ErrorState } from "./shared/ErrorState";

const MAX_WIDGETS = 12;

const WIDGET_KINDS: WidgetKind[] = ["stat", "bar", "line", "pie"];
const AGGREGATIONS: AggregationKind[] = ["SUM", "AVG", "COUNT", "MIN", "MAX"];
const TIMEFRAMES: Timeframe[] = [
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "LAST_90_DAYS",
  "MTD",
  "QTD",
  "YTD",
  "ALL",
];
const DASHBOARD_ENTITIES = [
  "expenses",
  "invoices",
  "deals",
  "support_tickets",
  "tasks",
];
const GROUP_BY_FIELDS = ["", "status", "category", "departmentId", "userId"];

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  LAST_7_DAYS: "Last 7 days",
  LAST_30_DAYS: "Last 30 days",
  LAST_90_DAYS: "Last 90 days",
  MTD: "Month to date",
  QTD: "Quarter to date",
  YTD: "Year to date",
  ALL: "All time",
};

const COLOR_TOKENS: Record<string, string> = {
  blue: "var(--chart-3)",
  emerald: "var(--chart-2)",
  violet: "var(--chart-4)",
  amber: "var(--chart-4)",
  rose: "var(--chart-5)",
  slate: "var(--chart-1)",
};

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const SPAN_CLASSES: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};

function spanClass(span: number | undefined): string {
  return SPAN_CLASSES[Math.min(12, Math.max(1, span ?? 3))] ?? "md:col-span-3";
}

function chartColor(color: string | undefined): string {
  return COLOR_TOKENS[color ?? ""] ?? "var(--chart-1)";
}

const NUMBER_FORMAT = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});
const CURRENCY_FORMAT = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatWidgetValue(
  value: number | null | undefined,
  format: DashboardWidget["format"],
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  if (format === "currency") return CURRENCY_FORMAT.format(value);
  if (format === "percent") return `${NUMBER_FORMAT.format(value)}%`;
  return NUMBER_FORMAT.format(value);
}

interface PresetWidget extends Omit<DashboardWidget, "id"> {
  presetId: string;
}

/** Curated, backend-valid widget templates for the custom builder. */
export const PRESET_WIDGETS: PresetWidget[] = [
  {
    presetId: "pipeline",
    kind: "stat",
    title: "Pipeline value",
    entity: "deals",
    aggregation: "SUM",
    field: "amount",
    timeframe: "ALL",
    filters: [],
    groupBy: null,
    format: "currency",
    color: "blue",
    span: 3,
  },
  {
    presetId: "expenses-90",
    kind: "stat",
    title: "Spend (90 days)",
    entity: "expenses",
    aggregation: "SUM",
    field: "amount",
    timeframe: "LAST_90_DAYS",
    filters: [],
    groupBy: null,
    format: "currency",
    color: "rose",
    span: 3,
  },
  {
    presetId: "invoices-30",
    kind: "stat",
    title: "Invoices raised (30 days)",
    entity: "invoices",
    aggregation: "COUNT",
    field: "",
    timeframe: "LAST_30_DAYS",
    filters: [],
    groupBy: null,
    format: "number",
    color: "emerald",
    span: 3,
  },
  {
    presetId: "tickets-open",
    kind: "stat",
    title: "Support tickets (30 days)",
    entity: "support_tickets",
    aggregation: "COUNT",
    field: "",
    timeframe: "LAST_30_DAYS",
    filters: [],
    groupBy: null,
    format: "number",
    color: "amber",
    span: 3,
  },
  {
    presetId: "expenses-by-department",
    kind: "bar",
    title: "Spend by department",
    entity: "expenses",
    aggregation: "SUM",
    field: "amount",
    timeframe: "LAST_90_DAYS",
    filters: [],
    groupBy: "departmentId",
    format: "currency",
    color: "violet",
    span: 4,
  },
  {
    presetId: "invoices-by-status",
    kind: "pie",
    title: "Invoices by status",
    entity: "invoices",
    aggregation: "COUNT",
    field: "",
    timeframe: "ALL",
    filters: [],
    groupBy: "status",
    format: "number",
    color: "emerald",
    span: 4,
  },
  {
    presetId: "deals-by-stage",
    kind: "bar",
    title: "Deal value by stage",
    entity: "deals",
    aggregation: "SUM",
    field: "amount",
    timeframe: "ALL",
    filters: [],
    groupBy: "status",
    format: "currency",
    color: "blue",
    span: 4,
  },
  {
    presetId: "tasks-by-status",
    kind: "line",
    title: "Tasks by status",
    entity: "tasks",
    aggregation: "COUNT",
    field: "",
    timeframe: "ALL",
    filters: [],
    groupBy: "status",
    format: "number",
    color: "amber",
    span: 6,
  },
];

function widgetSeries(
  series: Array<{ key: string | null; value: number | null }> | undefined,
): Array<{ label: string; value: number }> {
  return (series ?? []).map((point) => ({
    label: point.key === null || point.key === "" ? "Unassigned" : point.key,
    value: point.value ?? 0,
  }));
}

function WidgetChart({
  widget,
  series,
}: {
  widget: DashboardWidget;
  series: Array<{ label: string; value: number }>;
}) {
  const color = chartColor(widget.color);
  const chartConfig: ChartConfig = {
    value: { label: widget.title, color },
  };

  if (widget.kind === "pie") {
    return (
      <ChartContainer config={chartConfig} className="mx-auto h-48 w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
          <Pie data={series} dataKey="value" nameKey="label" outerRadius={72}>
            {series.map((entry, index) => (
              <Cell
                key={entry.label}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-48 w-full">
      {widget.kind === "line" ? (
        <LineChart data={series} margin={{ left: 4, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="value"
            type="monotone"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      ) : (
        <BarChart data={series} margin={{ left: 4, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ChartContainer>
  );
}

function WidgetCard({
  widget,
  loading,
  result,
}: {
  widget: DashboardWidget;
  loading: boolean;
  result?: {
    value?: number | null;
    series?: Array<{ key: string | null; value: number | null }>;
    error?: { code: string; message: string };
  };
}) {
  const series = widgetSeries(result?.series);

  return (
    <Card className={cn("gap-3 py-4", spanClass(widget.span))}>
      <CardHeader className="px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {loading ? (
          <Skeleton className="h-12 w-24" />
        ) : result?.error ? (
          <p className="text-xs text-destructive">{result.error.message}</p>
        ) : widget.kind === "stat" ? (
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-semibold tabular-nums">
              {formatWidgetValue(result?.value, widget.format)}
            </span>
            <span className="text-xs text-muted-foreground">
              {TIMEFRAME_LABELS[widget.timeframe] ?? widget.timeframe}
              {widget.groupBy ? ` · by ${widget.groupBy}` : ""}
            </span>
          </div>
        ) : series.length === 0 ? (
          <p className="py-12 text-center text-xs text-muted-foreground">
            No data for this timeframe.
          </p>
        ) : (
          <WidgetChart widget={widget} series={series} />
        )}
      </CardContent>
    </Card>
  );
}

function BuilderRow({
  widget,
  onChange,
  onRemove,
  disabled,
}: {
  widget: DashboardWidget;
  onChange: (next: DashboardWidget) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-1 text-xs font-medium">
        Title
        <Input
          value={widget.title}
          onChange={(event) => onChange({ ...widget, title: event.target.value })}
          disabled={disabled}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Type
        <Select
          value={widget.kind}
          onChange={(event) =>
            onChange({ ...widget, kind: event.target.value as WidgetKind })
          }
          disabled={disabled}
        >
          {WIDGET_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Entity
        <Select
          value={widget.entity}
          onChange={(event) => onChange({ ...widget, entity: event.target.value })}
          disabled={disabled}
        >
          {DASHBOARD_ENTITIES.map((entity) => (
            <option key={entity} value={entity}>
              {entity.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Aggregation
        <Select
          value={widget.aggregation}
          onChange={(event) =>
            onChange({
              ...widget,
              aggregation: event.target.value as AggregationKind,
            })
          }
          disabled={disabled}
        >
          {AGGREGATIONS.map((aggregation) => (
            <option key={aggregation} value={aggregation}>
              {aggregation}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Field
        <Input
          value={widget.field}
          onChange={(event) => onChange({ ...widget, field: event.target.value })}
          placeholder={widget.aggregation === "COUNT" ? "not required" : "amount"}
          disabled={disabled || widget.aggregation === "COUNT"}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Timeframe
        <Select
          value={widget.timeframe}
          onChange={(event) =>
            onChange({
              ...widget,
              timeframe: event.target.value as Timeframe,
            })
          }
          disabled={disabled}
        >
          {TIMEFRAMES.map((timeframe) => (
            <option key={timeframe} value={timeframe}>
              {TIMEFRAME_LABELS[timeframe]}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Group by
        <Select
          value={widget.groupBy ?? ""}
          onChange={(event) =>
            onChange({ ...widget, groupBy: event.target.value || null })
          }
          disabled={disabled}
        >
          {GROUP_BY_FIELDS.map((field) => (
            <option key={field || "none"} value={field}>
              {field || "None"}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Format
        <Select
          value={widget.format}
          onChange={(event) =>
            onChange({
              ...widget,
              format: event.target.value as DashboardWidget["format"],
            })
          }
          disabled={disabled}
        >
          {(["number", "currency", "percent"] as const).map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Width
        <Select
          value={String(widget.span)}
          onChange={(event) =>
            onChange({ ...widget, span: Number(event.target.value) })
          }
          disabled={disabled}
        >
          {Object.keys(SPAN_CLASSES).map((span) => (
            <option key={span} value={span}>
              {span} / 12
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium">
        Colour
        <Select
          value={widget.color}
          onChange={(event) => onChange({ ...widget, color: event.target.value })}
          disabled={disabled}
        >
          {Object.keys(COLOR_TOKENS).map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </Select>
      </label>

      <div className="flex items-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${widget.title}`}
        >
          <Trash2 aria-hidden="true" />
          Remove
        </Button>
      </div>
    </div>
  );
}

export function DashboardRenderer({ definition }: ModuleRendererProps) {
  const { can } = useModuleContext();
  const config = definition.config as DashboardConfig;
  const { deptKey, moduleKey } = moduleLocation(definition);
  const { user } = useAuth();

  const isTenantAdmin = isTenantAdminRole(
    user?.role as
      | string
      | { isTenantAdmin?: boolean; slug?: string }
      | undefined,
  );

  const widgets = config.widgets ?? [];

  const aggregate = useDashboardAggregate(deptKey, moduleKey, widgets);
  const updateConfig = useUpdateModuleConfig(deptKey, moduleKey);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [draft, setDraft] = useState<DashboardWidget[]>([]);

  const resultsById = useMemo(() => {
    const map = new Map<string, AggregateWidgetResult>();
    for (const result of aggregate.data?.results ?? []) {
      map.set(result.id, result);
    }
    return map;
  }, [aggregate.data]);

  const openBuilder = () => {
    setDraft(widgets.map((widget) => ({ ...widget, filters: [...widget.filters] })));
    setBuilderOpen(true);
  };

  const cancelBuilder = () => {
    setBuilderOpen(false);
    setDraft([]);
  };

  const addPreset = (preset: PresetWidget) => {
    if (draft.length >= MAX_WIDGETS) return;
    const { presetId, ...widget } = preset;
    setDraft((current) => [
      ...current,
      {
        ...widget,
        id: `${presetId}-${current.length + 1}-${Date.now().toString(36)}`,
        filters: [...widget.filters],
      },
    ]);
  };

  const saveBuilder = () => {
    const invalid = draft.find(
      (widget) =>
        widget.aggregation !== "COUNT" && widget.field.trim().length === 0,
    );

    if (invalid) {
      toast.error(`"${invalid.title}" needs a field for ${invalid.aggregation}.`);
      return;
    }

    updateConfig.mutate(
      { ...config, widgets: draft },
      {
        onSuccess: () => {
          toast.success("Dashboard saved.");
          cancelBuilder();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const canEdit = isTenantAdmin && can("EDIT");

  if (aggregate.isError) {
    return (
      <ErrorState
        title="Could not load the dashboard"
        message={aggregate.error.message}
        onRetry={() => void aggregate.refetch()}
      />
    );
  }

  return (
    <section className="flex flex-col gap-4" aria-label={definition.name}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            {widgets.length} widget{widgets.length === 1 ? "" : "s"}
          </span>
          {aggregate.data?.generatedAt ? (
            <span>
              · updated{" "}
              {new Date(aggregate.data.generatedAt).toLocaleTimeString()}
            </span>
          ) : null}
        </div>
        {canEdit && !builderOpen ? (
          <Button size="sm" variant="outline" onClick={openBuilder}>
            <Pencil aria-hidden="true" />
            Customise
          </Button>
        ) : null}
      </div>

      {builderOpen ? (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">Customise dashboard</h2>
              <p className="text-xs text-muted-foreground">
                Layout is tenant-wide and limited to {MAX_WIDGETS} widgets.
              </p>
            </div>
            <BadgeCount count={draft.length} />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Preset library
            </h3>
            <div className="flex flex-wrap gap-2">
              {PRESET_WIDGETS.map((preset) => (
                <Button
                  key={preset.presetId}
                  size="sm"
                  variant="outline"
                  disabled={draft.length >= MAX_WIDGETS || updateConfig.isPending}
                  onClick={() => addPreset(preset)}
                >
                  <Plus aria-hidden="true" />
                  {preset.title}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {draft.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
                Add a preset to start building this dashboard.
              </p>
            ) : (
              draft.map((widget, index) => (
                <BuilderRow
                  key={widget.id}
                  widget={widget}
                  disabled={updateConfig.isPending}
                  onChange={(next) =>
                    setDraft((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index ? next : entry,
                      ),
                    )
                  }
                  onRemove={() =>
                    setDraft((current) =>
                      current.filter((_, entryIndex) => entryIndex !== index),
                    )
                  }
                />
              ))
            )}
          </div>

          {updateConfig.error ? (
            <p role="alert" className="text-xs text-destructive">
              {updateConfig.error.message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <Button onClick={saveBuilder} disabled={updateConfig.isPending}>
              <Save aria-hidden="true" />
              {updateConfig.isPending ? "Saving…" : "Save changes"}
            </Button>
            <Button
              variant="outline"
              onClick={openBuilder}
              disabled={updateConfig.isPending}
            >
              <RotateCcw aria-hidden="true" />
              Reset
            </Button>
            <Button
              variant="ghost"
              onClick={cancelBuilder}
              disabled={updateConfig.isPending}
            >
              <X aria-hidden="true" />
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {widgets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
          <h2 className="text-base font-semibold">No widgets configured</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {canEdit
              ? "Use the preset library to build this dashboard."
              : "A tenant admin can add widgets to this dashboard."}
          </p>
          {canEdit ? (
            <Button size="sm" onClick={openBuilder}>
              <Plus aria-hidden="true" />
              Add widgets
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              loading={aggregate.isPending}
              result={resultsById.get(widget.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function BadgeCount({ count }: { count: number }) {
  return (
    <span className="rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {count} / {MAX_WIDGETS}
    </span>
  );
}
