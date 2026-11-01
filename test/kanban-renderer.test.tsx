import { fireEvent, screen, waitFor } from "@testing-library/react";
import { KanbanRenderer } from "@/components/renderers/KanbanRenderer";
import {
  useWorkspaceRecords,
  useWorkspaceRecordMutations,
} from "@/hooks/workspace/useWorkspaceRecords";
import type { KanbanConfig, ModuleDefinition } from "@/lib/workspace-types";
import { buildEntityMeta, renderRenderer } from "./utils/renderers";

jest.mock("@/hooks/workspace/useWorkspaceRecords", () => ({
  useWorkspaceRecords: jest.fn(),
  useWorkspaceRecordMutations: jest.fn(),
}));

const mockRecords = useWorkspaceRecords as jest.Mock;
const mockMutations = useWorkspaceRecordMutations as jest.Mock;

const config: KanbanConfig = {
  version: 1,
  entity: "deals",
  statusField: "status",
  columns: [
    { value: "Lead", label: "Lead", color: "slate" },
    { value: "Won", label: "Won", color: "emerald" },
  ],
  secondaryColumns: [],
  titleField: "name",
  valueField: "amount",
  assigneeField: "owner",
  dueField: null,
  allowCreate: true,
  allowMove: true,
};

const definition: ModuleDefinition = {
  id: "module-deals",
  key: "deals",
  path: "/dept/sales/deals",
  name: "Deals",
  icon: "briefcase",
  group: "Pipeline",
  order: 2,
  type: "KANBAN_BOARD",
  targetEntity: "deals",
  config,
  isNavigable: true,
  description: null,
  department: null,
  dataScope: "TENANT",
  actions: ["VIEW", "CREATE", "EDIT"],
  entityMeta: null,
};

const rows = [
  {
    id: "deal-1",
    name: "Acme renewal",
    status: "Lead",
    amount: 25000,
    owner: { name: "Sam" },
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-01T10:00:00.000Z",
  },
  {
    id: "deal-2",
    name: "Globex expansion",
    status: "Won",
    amount: 40000,
    owner: null,
    createdAt: "2026-10-02T10:00:00.000Z",
    updatedAt: "2026-10-02T10:00:00.000Z",
  },
];

const page = {
  data: rows,
  meta: { page: 1, pageSize: 100, total: 2, totalPages: 1 },
  scope: "TENANT" as const,
};

const transition = jest.fn();

const mutations = {
  create: { mutate: jest.fn(), isPending: false, error: null },
  update: { mutate: jest.fn(), isPending: false, error: null },
  remove: { mutate: jest.fn(), isPending: false, error: null },
  transition: { mutate: transition, isPending: false, error: null },
};

function renderBoard(actions: Array<"VIEW" | "CREATE" | "EDIT"> = [
  "VIEW",
  "CREATE",
  "EDIT",
]) {
  const entityMeta = buildEntityMeta({
    key: "deals",
    label: "Deal",
    fields: [
      { name: "name", label: "Deal", type: "text", writable: true, required: true },
      { name: "amount", label: "Amount", type: "currency", writable: true },
      {
        name: "status",
        label: "Stage",
        type: "enum",
        writable: true,
        enumValues: ["Lead", "Won"],
      },
    ],
    statusField: "status",
    statusOptions: ["Lead", "Won"],
  });

  return renderRenderer(<KanbanRenderer definition={definition} />, {
    definition,
    entityMeta,
    actions,
  });
}

describe("KanbanRenderer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRecords.mockReturnValue({
      data: page,
      isPending: false,
      isError: false,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
    });
    mockMutations.mockReturnValue(mutations);
  });

  it("groups cards into their configured columns", () => {
    renderBoard();

    expect(screen.getByLabelText("Lead column")).toBeInTheDocument();
    expect(screen.getByLabelText("Won column")).toBeInTheDocument();
    expect(screen.getByText("Acme renewal")).toBeInTheDocument();
    expect(screen.getByText("Globex expansion")).toBeInTheDocument();
    expect(screen.getByText(/25,000/)).toBeInTheDocument();
    expect(screen.getByText("2 cards")).toBeInTheDocument();
  });

  it("moves a card through the keyboard-accessible menu", async () => {
    renderBoard();

    fireEvent.change(
      screen.getByLabelText("Move Acme renewal to another column"),
      { target: { value: "Won" } },
    );

    await waitFor(() => {
      expect(transition).toHaveBeenCalledWith(
        { id: "deal-1", status: "Won" },
        expect.any(Object),
      );
    });
  });

  it("moves a card with native drag and drop", async () => {
    renderBoard();

    const dataTransfer = {
      setData: jest.fn(),
      getData: jest.fn().mockReturnValue("deal-1"),
      effectAllowed: "",
      dropEffect: "",
    };

    const card = screen.getByText("Acme renewal").closest("article");
    expect(card).not.toBeNull();

    fireEvent.dragStart(card as HTMLElement, { dataTransfer });
    fireEvent.drop(screen.getByLabelText("Won column"), { dataTransfer });

    await waitFor(() => {
      expect(transition).toHaveBeenCalledWith(
        { id: "deal-1", status: "Won" },
        expect.any(Object),
      );
    });
  });

  it("ignores a drop onto the card's current column", () => {
    renderBoard();

    const dataTransfer = {
      setData: jest.fn(),
      getData: jest.fn().mockReturnValue("deal-1"),
      effectAllowed: "",
      dropEffect: "",
    };

    fireEvent.drop(screen.getByLabelText("Lead column"), { dataTransfer });

    expect(transition).not.toHaveBeenCalled();
  });

  it("hides move controls without EDIT permission", () => {
    renderBoard(["VIEW"]);

    expect(
      screen.queryByLabelText("Move Acme renewal to another column"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /New card/ }),
    ).not.toBeInTheDocument();
  });

  it("creates a card pre-filled with the column status", () => {
    renderBoard();

    fireEvent.click(screen.getAllByRole("button", { name: /Add card/ })[0]);

    expect(
      screen.getByRole("heading", { name: "New card" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Stage")).toHaveValue("Lead");
  });
});
