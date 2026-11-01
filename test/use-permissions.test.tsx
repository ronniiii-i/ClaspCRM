import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePermissions } from '@/hooks/usePermissions';
import { ACLService } from '@/services/acl';
import { buildModule, buildUser } from './utils/factories';

jest.mock('@/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/services/acl', () => ({
  ACLService: {
    getAccessibleModules: jest.fn(),
    checkPermission: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useAuth } = require('@/hooks/useAuth');

const mockAuth = useAuth as jest.Mock;
const getAccessibleModules = ACLService.getAccessibleModules as jest.Mock;
const checkPermission = ACLService.checkPermission as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockReturnValue({
      user: buildUser(),
      token: 'test-token',
      isLoading: false,
    });
  });

  it('reads actions from the ACL payload', async () => {
    const invoices = buildModule(
      'invoices',
      'Invoices',
      '/dept/finance/invoices',
      'Finance',
      { actions: ['VIEW', 'CREATE', 'EDIT'] },
    );
    getAccessibleModules.mockResolvedValue([invoices]);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.modules).toHaveLength(1));

    await expect(result.current.hasPermission('invoices', 'EDIT')).resolves.toBe(
      true,
    );
    await expect(
      result.current.hasPermission('invoices', 'DELETE'),
    ).resolves.toBe(false);
  });

  it('falls back to the session modules when the ACL request fails', async () => {
    const fallback = buildModule(
      'leads',
      'Leads',
      '/dept/sales/leads',
      'Sales',
      { actions: ['VIEW'] },
    );
    mockAuth.mockReturnValue({
      user: buildUser({ accessibleModules: [fallback] }),
      token: 'test-token',
      isLoading: false,
    });
    getAccessibleModules.mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.modules.map((entry) => entry.key)).toEqual([
        'leads',
      ]),
    );
    await expect(result.current.hasPermission('leads', 'VIEW')).resolves.toBe(
      true,
    );
  });

  it('asks the backend when the module is missing from the payload', async () => {
    getAccessibleModules.mockResolvedValue([]);
    checkPermission.mockResolvedValue(true);

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      result.current.hasPermission('unknown-module', 'VIEW'),
    ).resolves.toBe(true);
    expect(checkPermission).toHaveBeenCalledWith(
      'test-token',
      'unknown-module',
      'VIEW',
    );
  });
});
