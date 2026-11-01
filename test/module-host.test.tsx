import { render, screen } from '@testing-library/react';
import { ModuleHost } from '@/components/renderers/ModuleHost';
import { ApiError } from '@/services/api-client';
import type { ModuleDefinition } from '@/lib/workspace-types';

jest.mock('@/hooks/workspace/useModuleDefinition', () => ({
  useModuleDefinition: jest.fn(),
}));

jest.mock('@/hooks/workspace/useWorkspaceRecords', () => ({
  useWorkspaceRecords: () => ({
    data: {
      data: [],
      meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
      scope: 'DEPARTMENT',
    },
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch: jest.fn(),
  }),
  useWorkspaceRecordMutations: () => ({
    create: { mutate: jest.fn(), isPending: false, error: null },
    update: { mutate: jest.fn(), isPending: false, error: null },
    remove: { mutate: jest.fn(), isPending: false, error: null },
    transition: { mutate: jest.fn(), isPending: false, error: null },
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useModuleDefinition } = require('@/hooks/workspace/useModuleDefinition');
const mockDefinition = useModuleDefinition as jest.Mock;

const definition: ModuleDefinition = {
  id: 'module-invoices',
  key: 'invoices',
  path: '/dept/finance/invoices',
  name: 'Invoices',
  icon: 'file-text',
  group: 'Finance',
  order: 1,
  type: 'DATA_TABLE',
  targetEntity: 'invoices',
  config: {
    version: 1,
    entity: 'invoices',
    columns: [],
    defaultSort: { field: 'createdAt', dir: 'desc' },
    pageSize: 20,
    searchFields: [],
    createEnabled: true,
    filters: [],
  },
  isNavigable: true,
  description: 'All invoices',
  department: {
    id: 'dept-finance',
    key: 'finance',
    name: 'Finance',
    sortOrder: 1,
  },
  dataScope: 'DEPARTMENT',
  actions: ['VIEW', 'EDIT'],
  entityMeta: null,
};

describe('ModuleHost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the module header, scope and renderer', () => {
    mockDefinition.mockReturnValue({
      isPending: false,
      error: null,
      data: definition,
    });

    render(<ModuleHost deptKey="finance" moduleKey="invoices" />);

    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(
      screen.getByText('Scope: Department — Finance'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No records match the current filters.'),
    ).toBeInTheDocument();
  });

  it('renders a not-found state for a 404', () => {
    mockDefinition.mockReturnValue({
      isPending: false,
      error: new ApiError('Missing', 404, 'NOT_FOUND'),
      data: undefined,
    });

    render(<ModuleHost deptKey="finance" moduleKey="missing" />);

    expect(screen.getByText('Module not found')).toBeInTheDocument();
  });

  it('renders a forbidden state for a 403', () => {
    mockDefinition.mockReturnValue({
      isPending: false,
      error: new ApiError('Denied', 403, 'FORBIDDEN'),
      data: undefined,
    });

    render(<ModuleHost deptKey="finance" moduleKey="invoices" />);

    expect(
      screen.getByText('You do not have access to this module'),
    ).toBeInTheDocument();
  });

  it('rejects invalid route keys without fetching', () => {
    mockDefinition.mockReturnValue({
      isPending: true,
      error: null,
      data: undefined,
    });

    render(<ModuleHost deptKey="bad key" moduleKey="../etc" />);

    expect(screen.getByText('Module not found')).toBeInTheDocument();
    expect(mockDefinition).toHaveBeenCalledWith('', '');
  });

  it('reports unsupported module types', () => {
    mockDefinition.mockReturnValue({
      isPending: false,
      error: null,
      data: { ...definition, type: 'UNKNOWN' as ModuleDefinition['type'] },
    });

    render(<ModuleHost deptKey="finance" moduleKey="invoices" />);

    expect(screen.getByText('Unsupported module type')).toBeInTheDocument();
  });
});
