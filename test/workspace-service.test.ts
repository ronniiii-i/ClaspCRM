import {
  buildRecordsSearchParams,
  WorkspaceService,
} from "@/services/workspace";

jest.mock("@/services/api-client", () => ({
  apiRequest: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { apiRequest } = require("@/services/api-client");
const mockRequest = apiRequest as jest.Mock;

const page = {
  data: [],
  meta: { page: 1, pageSize: 25, total: 0, totalPages: 1 },
  scope: "TENANT",
};

describe("workspace records query", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue(page);
  });

  it("serialises search, sort, paging and filters", () => {
    const params = new URLSearchParams(
      buildRecordsSearchParams({
        search: "  acme  ",
        page: 2,
        pageSize: 50,
        sort: { field: "amount", dir: "desc" },
        include: ["customer", "department"],
        filters: [
          { field: "status", value: "PAID" },
          { field: "amount", op: "gte", value: 100 },
          { field: "category", op: "in", value: ["Travel", "Software"] },
          { field: "description", op: "contains", value: null },
        ],
      }),
    );

    expect(params.get("search")).toBe("acme");
    expect(params.get("page")).toBe("2");
    expect(params.get("pageSize")).toBe("50");
    expect(params.get("sort")).toBe("amount:desc");
    expect(params.get("include")).toBe("customer,department");
    expect(params.get("filter[status]")).toBe("PAID");
    expect(params.get("filter[amount][gte]")).toBe("100");
    expect(params.get("filter[category][in]")).toBe("Travel,Software");
    // Null and undefined filters are skipped rather than sent as "null".
    expect(params.has("filter[description][contains]")).toBe(false);
  });

  it("omits default paging and empty search", () => {
    expect(buildRecordsSearchParams({ page: 1, search: "   " })).toBe("");
    expect(buildRecordsSearchParams({})).toBe("");
  });
});

describe("WorkspaceService endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue(page);
  });

  it("lists module records under the canonical module path", async () => {
    await WorkspaceService.listRecords("finance", "invoices", {
      sort: { field: "dueDate", dir: "asc" },
    });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("/workspace/modules/finance/invoices/records"),
      expect.objectContaining({ errorMessage: "Failed to load records" }),
    );
    expect(mockRequest.mock.calls[0][0]).toContain("sort=dueDate%3Aasc");
  });

  it("posts a transition with the target status", async () => {
    mockRequest.mockResolvedValue({ id: "record-1", status: "Won" });

    await WorkspaceService.transitionRecord("sales", "deals", "record-1", "Won");

    expect(mockRequest).toHaveBeenCalledWith(
      "/workspace/modules/sales/deals/records/record-1/transition",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ status: "Won" }),
      }),
    );
  });

  it("batches dashboard widgets", async () => {
    mockRequest.mockResolvedValue({ results: [], generatedAt: "now", scope: "TENANT" });

    await WorkspaceService.aggregate("finance", "overview", [
      { id: "spend", entity: "expenses" },
    ]);

    expect(mockRequest).toHaveBeenCalledWith(
      "/workspace/modules/finance/overview/aggregate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ widgets: [{ id: "spend", entity: "expenses" }] }),
      }),
    );
  });

  it("archives documents by default and hard-deletes on request", async () => {
    mockRequest.mockResolvedValue({ id: "doc-1", archived: true, deleted: false });

    await WorkspaceService.deleteDocument("hr", "policies", "doc-1");
    expect(mockRequest).toHaveBeenCalledWith(
      "/workspace/modules/hr/policies/documents/doc-1",
      expect.objectContaining({ method: "DELETE" }),
    );

    await WorkspaceService.deleteDocument("hr", "policies", "doc-1", true);
    expect(mockRequest).toHaveBeenCalledWith(
      "/workspace/modules/hr/policies/documents/doc-1?hard=true",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("wraps form data in the documented envelope", async () => {
    mockRequest.mockResolvedValue({
      submissionId: "sub-1",
      status: "SUBMITTED",
    });

    await WorkspaceService.submitForm("hr", "onboarding", { name: "Ada" });

    expect(mockRequest).toHaveBeenCalledWith(
      "/workspace/modules/hr/onboarding/submissions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ data: { name: "Ada" } }),
      }),
    );
  });
});
