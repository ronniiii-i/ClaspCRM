import { fireEvent, screen } from "@testing-library/react";
import {
  DashboardRenderer,
  formatWidgetValue,
} from "@/components/renderers/DashboardRenderer";
import {
  useDashboardAggregate,
  useUpdateModuleConfig,
} from "@/hooks/workspace/useWorkspaceAggregate";
import { useAuth } from "@/hooks/useAuth";
import type { DashboardConfig, ModuleDefinition } from "@/lib/workspace-types";
import { renderRenderer } from "./utils/renderers";

jest.mock("@/hooks/workspace/useWorkspaceAggregate", () => ({
  useDashboardAggregate: jest.fn(),
  useUpdateModuleConfig: jest.fn(),
}));

jest.mock("@/hooks/useAuth", () => ({ useAuth: jest.fn() }));

const mockAggregate = useDashboardAggregate as jest.Mock;
const mockUpdateConfig = useUpdateModuleConfig as jest.Mock;
const mockAuth = useAuth as jest.Mock;

const config: DashboardConfig = {
  version: 1,
  layout: "grid",
  columns: 12,
  widgets: [
    {
      id: "pipeline",
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
      id: "spend",
      kind: "stat",
      title: "Spend (90 days)",
      entity: "expenses",
      aggregation: "SUM",
      field: "amount",
      timeframe: "LAST_90_DAYS",
      filters: [],
      groupBy: null,
      format: "number",
      color: "rose",
      span: 3,
    },
  ],
};

const definition: ModuleDefinition = {
  id: "module-overview",
  key: "overview",
  path: "/dept/finance/overview",
  name: "Finance overview",
  icon: "layout-dashboard",
  group: "Finance",
  order: 0,
  type: "DASHBOARD_VIEW",
  targetEntity: null,
  config,
  isNavigable: true,
  description: null,
  department: null,
  dataScope: "TENANT",
  actions: ["VIEW", "EDIT"],
  entityMeta: null,
};

const mutateConfig = jest.fn();

function renderDashboard(actions: Array<"VIEW" | "EDIT"> = ["VIEW", "EDIT"]) {
  return renderRenderer(<DashboardRenderer definition={definition} />, {
    definition,
    actions,
  });
}

describe("DashboardRenderer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockReturnValue({
      user: { id: "user-1", role: { isTenantAdmin: true, slug: "tenant_admin" } },
    });
    mockAggregate.mockReturnValue({
      data: {
        results: [
          { id: "pipeline", value: 50000 },
          { id: "spend", value: 1250.5 },
        ],
        generatedAt: "2026-11-01T10:00:00.000Z",
        scope: "TENANT",
      },
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    mockUpdateConfig.mockReturnValue({
      mutate: mutateConfig,
      isPending: false,
      error: null,
    });
  });

  it("renders batched widget values with their format", () => {
    renderDashboard();

    expect(screen.getByText("Pipeline value")).toBeInTheDocument();
    expect(
      screen.getByText(formatWidgetValue(50000, "currency")),
    ).toBeInTheDocument();
    expect(screen.getByText("1,250.5")).toBeInTheDocument();
    expect(screen.getByText(/2 widgets/)).toBeInTheDocument();
  });

  it("shows widget-level errors without blanking the dashboard", () => {
    mockAggregate.mockReturnValue({
      data: {
        results: [
          { id: "pipeline", error: { code: "BAD", message: "Bad field." } },
          { id: "spend", value: 10 },
        ],
        generatedAt: "2026-11-01T10:00:00.000Z",
        scope: "TENANT",
      },
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    renderDashboard();

    expect(screen.getByText("Bad field.")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("lets a tenant admin add presets and save the layout", () => {
    renderDashboard();

    fireEvent.click(screen.getByRole("button", { name: /Customise/ }));

    expect(screen.getByText("Preset library")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pipeline value" }));

    expect(screen.getAllByDisplayValue("Pipeline value")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /Save changes/ }));

    expect(mutateConfig).toHaveBeenCalledTimes(1);
    const payload = mutateConfig.mock.calls[0][0];
    expect(payload.widgets).toHaveLength(3);
  });

  it("hides the builder from non-admin users", () => {
    mockAuth.mockReturnValue({ user: { id: "user-2", role: "STAFF" } });

    renderDashboard();

    expect(
      screen.queryByRole("button", { name: /Customise/ }),
    ).not.toBeInTheDocument();
  });

  it("shows the empty state with an admin action", () => {
    mockAggregate.mockReturnValue({
      data: {
        results: [],
        generatedAt: "2026-11-01T10:00:00.000Z",
        scope: "TENANT",
      },
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    renderRenderer(
      <DashboardRenderer
        definition={{ ...definition, config: { ...config, widgets: [] } }}
      />,
      { definition, actions: ["VIEW", "EDIT"] },
    );

    expect(screen.getByText("No widgets configured")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Add widgets/ }),
    ).toBeInTheDocument();
  });

  it("formats widget values defensively", () => {
    expect(formatWidgetValue(1234.56, "number")).toBe("1,234.6");
    expect(formatWidgetValue(1234.56, "currency")).toMatch(/1,235/);
    expect(formatWidgetValue(12.5, "percent")).toBe("12.5%");
    expect(formatWidgetValue(null, "currency")).toBe("—");
  });
});
