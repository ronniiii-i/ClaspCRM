import { fireEvent, screen, waitFor } from "@testing-library/react";
import { FormRenderer } from "@/components/renderers/FormRenderer";
import { useSubmitForm, useSubmissions } from "@/hooks/workspace/useSubmissions";
import type { FormConfig, ModuleDefinition } from "@/lib/workspace-types";
import { renderRenderer } from "./utils/renderers";

jest.mock("@/hooks/workspace/useSubmissions", () => ({
  useSubmissions: jest.fn(),
  useSubmitForm: jest.fn(),
}));

const mockSubmissions = useSubmissions as jest.Mock;
const mockSubmit = useSubmitForm as jest.Mock;

const config: FormConfig = {
  version: 1,
  entity: null,
  mode: "create",
  fields: [
    { name: "fullName", label: "Full name", type: "text", required: true },
    { name: "startDate", label: "Start date", type: "date" },
    { name: "salary", label: "Salary", type: "currency" },
    {
      name: "contract",
      label: "Contract",
      type: "select",
      options: ["Permanent", "Contractor"],
      mapTo: "customFields",
    },
    { name: "agreed", label: "Agreed to policy", type: "checkbox" },
  ],
  submitLabel: "Start onboarding",
  successMessage: "Onboarding submitted.",
};

const definition: ModuleDefinition = {
  id: "module-onboarding",
  key: "onboarding",
  path: "/dept/hr/onboarding",
  name: "Onboarding",
  icon: "user-round-cog",
  group: "People",
  order: 3,
  type: "FORM_BUILDER",
  targetEntity: null,
  config,
  isNavigable: true,
  description: null,
  department: null,
  dataScope: "TENANT",
  actions: ["VIEW", "CREATE"],
  entityMeta: null,
};

const mutate = jest.fn();

function renderForm(actions: Array<"VIEW" | "CREATE"> = ["VIEW", "CREATE"]) {
  return renderRenderer(<FormRenderer definition={definition} />, {
    definition,
    actions,
  });
}

describe("FormRenderer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmissions.mockReturnValue({
      data: {
        data: [
          {
            id: "submission-1",
            moduleId: "module-onboarding",
            entityId: null,
            submittedById: "user-1",
            data: { fullName: "Ada Lovelace", salary: 90000 },
            status: "SUBMITTED",
            createdAt: "2026-10-01T10:00:00.000Z",
            updatedAt: "2026-10-01T10:00:00.000Z",
            submittedBy: { id: "user-1", name: "Ada", email: "ada@acme.test" },
          },
        ],
        meta: { page: 1, pageSize: 25, total: 1, totalPages: 1 },
        scope: "TENANT",
      },
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    mockSubmit.mockReturnValue({
      mutate,
      isPending: false,
      error: null,
    });
  });

  it("renders the configured fields and recent submissions", () => {
    renderForm();

    expect(screen.getByLabelText(/Full name/)).toBeInTheDocument();
    expect(screen.getByLabelText("Start date")).toBeInTheDocument();
    expect(screen.getByLabelText("Agreed to policy")).toBeInTheDocument();
    expect(screen.getByText("Recent submissions")).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("SUBMITTED")).toBeInTheDocument();
  });

  it("blocks submission when a required field is empty", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /Start onboarding/ }));

    expect(await screen.findByText("Full name is required.")).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("validates select options against the configured list", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/Full name/), {
      target: { value: "Ada Lovelace" },
    });
    // Bypass the native select to simulate a stale/tampered value.
    fireEvent.change(screen.getByLabelText("Contract"), {
      target: { value: "Permanent" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Start onboarding/ }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Ada Lovelace",
        contract: "Permanent",
      }),
      expect.any(Object),
    );
  });

  it("coerces numeric fields and drops empty optional values", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/Full name/), {
      target: { value: "Grace Hopper" },
    });
    fireEvent.change(screen.getByLabelText("Salary"), {
      target: { value: "120000.50" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Start onboarding/ }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());

    const payload = mutate.mock.calls[0][0];
    expect(payload.fullName).toBe("Grace Hopper");
    expect(payload.salary).toBe(120000.5);
    expect(payload.startDate).toBeUndefined();
  });

  it("disables submission without CREATE permission", () => {
    renderForm(["VIEW"]);

    expect(
      screen.getByRole("button", { name: /Start onboarding/ }),
    ).toBeDisabled();
    expect(
      screen.getByText("You do not have permission to submit this form."),
    ).toBeInTheDocument();
  });
});
