import { fireEvent, screen, waitFor } from "@testing-library/react";
import { DocumentRenderer } from "@/components/renderers/DocumentRenderer";
import {
  useDocument,
  useDocumentMutations,
  useDocuments,
} from "@/hooks/workspace/useDocuments";
import type { DocumentConfig, ModuleDefinition } from "@/lib/workspace-types";
import { renderRenderer } from "./utils/renderers";

jest.mock("@/hooks/workspace/useDocuments", () => ({
  useDocuments: jest.fn(),
  useDocument: jest.fn(),
  useDocumentMutations: jest.fn(),
}));

const mockDocuments = useDocuments as jest.Mock;
const mockDocument = useDocument as jest.Mock;
const mockMutations = useDocumentMutations as jest.Mock;

const config: DocumentConfig = {
  version: 1,
  categories: ["Policies", "SOPs"],
  defaultFormat: "MARKDOWN",
  allowCreate: true,
  allowRichText: true,
};

const definition: ModuleDefinition = {
  id: "module-policies",
  key: "policies",
  path: "/dept/hr/policies",
  name: "Policies",
  icon: "file-text",
  group: "People",
  order: 4,
  type: "DOCUMENT_HUB",
  targetEntity: null,
  config,
  isNavigable: true,
  description: null,
  department: null,
  dataScope: "TENANT",
  actions: ["VIEW", "CREATE", "EDIT", "DELETE"],
  entityMeta: null,
};

const documents = [
  {
    id: "doc-1",
    title: "Leave policy",
    slug: "leave-policy",
    format: "MARKDOWN" as const,
    status: "PUBLISHED" as const,
    category: "Policies",
    version: 2,
    departmentId: null,
    createdById: "user-1",
    updatedById: "user-1",
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "doc-2",
    title: "Onboarding checklist",
    slug: "onboarding-checklist",
    format: "RICH_TEXT" as const,
    status: "DRAFT" as const,
    category: "SOPs",
    version: 1,
    departmentId: null,
    createdById: "user-1",
    updatedById: null,
    createdAt: "2026-10-03T10:00:00.000Z",
    updatedAt: "2026-10-03T10:00:00.000Z",
  },
];

const page = {
  data: documents,
  meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
};

const create = { mutate: jest.fn(), isPending: false, error: null };
const update = { mutate: jest.fn(), isPending: false, error: null };
const remove = { mutate: jest.fn(), isPending: false, error: null };

function renderDocuments(actions: Array<"VIEW" | "CREATE" | "EDIT" | "DELETE"> = [
  "VIEW",
  "CREATE",
  "EDIT",
  "DELETE",
]) {
  return renderRenderer(<DocumentRenderer definition={definition} />, {
    definition,
    actions,
  });
}

describe("DocumentRenderer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDocuments.mockReturnValue({
      data: page,
      isPending: false,
      isError: false,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
    });
    mockDocument.mockImplementation(
      (_dept: string, _module: string, id: string | null) => ({
        data: id
          ? {
              ...documents[0],
              content: "# Leave policy\n\nTwenty days per year.",
            }
          : undefined,
        isPending: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      }),
    );
    mockMutations.mockReturnValue({ create, update, remove });
  });

  it("lists documents with their metadata", () => {
    renderDocuments();

    expect(screen.getByText("Leave policy")).toBeInTheDocument();
    expect(screen.getByText("Onboarding checklist")).toBeInTheDocument();
    expect(screen.getAllByText("PUBLISHED").length).toBeGreaterThan(0);
    expect(screen.getByText("Rich text")).toBeInTheDocument();
    expect(screen.getByText("v2")).toBeInTheDocument();
    expect(screen.getByText("2 documents")).toBeInTheDocument();
  });

  it("filters by status and category", async () => {
    renderDocuments();

    fireEvent.change(screen.getByLabelText("Filter by status"), {
      target: { value: "PUBLISHED" },
    });
    fireEvent.change(screen.getByLabelText("Filter by category"), {
      target: { value: "Policies" },
    });

    await waitFor(() => {
      const lastCall = mockDocuments.mock.calls.at(-1);
      expect(lastCall?.[2]).toEqual(
        expect.objectContaining({ status: "PUBLISHED", category: "Policies" }),
      );
    });
  });

  it("opens the reader and renders sanitised markdown", () => {
    renderDocuments();

    fireEvent.click(screen.getByRole("button", { name: /Read Leave policy/ }));

    expect(mockDocument).toHaveBeenLastCalledWith("hr", "policies", "doc-1");
    expect(
      screen.getByText(/Twenty days per year\./),
    ).toBeInTheDocument();
  });

  it("creates a markdown document", async () => {
    renderDocuments();

    fireEvent.click(screen.getByRole("button", { name: /New document/ }));

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Expenses policy" },
    });
    fireEvent.change(screen.getByLabelText("Content"), {
      target: { value: "# Expenses" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create document/ }));

    await waitFor(() => expect(create.mutate).toHaveBeenCalled());

    expect(create.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Expenses policy",
        content: "# Expenses",
        format: "MARKDOWN",
        status: "DRAFT",
        category: null,
      }),
      expect.any(Object),
    );
  });

  it("requires a title before saving", () => {
    renderDocuments();

    fireEvent.click(screen.getByRole("button", { name: /New document/ }));
    fireEvent.click(screen.getByRole("button", { name: /Create document/ }));

    expect(screen.getByRole("alert")).toHaveTextContent("Title is required.");
    expect(create.mutate).not.toHaveBeenCalled();
  });

  it("archives a document after confirmation", async () => {
    renderDocuments();

    fireEvent.click(
      screen.getByRole("button", { name: /Archive Leave policy/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));

    await waitFor(() => {
      expect(remove.mutate).toHaveBeenCalledWith(
        { id: "doc-1" },
        expect.any(Object),
      );
    });
  });

  it("hides creation and archiving without permissions", () => {
    renderDocuments(["VIEW"]);

    expect(
      screen.queryByRole("button", { name: /New document/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Archive Leave policy/ }),
    ).not.toBeInTheDocument();
  });
});
