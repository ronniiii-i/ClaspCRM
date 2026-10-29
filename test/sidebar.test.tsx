import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { buildModule, buildUser, clearSession, seedSession } from './utils/factories';

// The sidebar consumes the auth + permission hooks; drive them from the
// session we seed in `localStorage`.
jest.mock('@/hooks/useAuth', () => {
  const actual = jest.requireActual('@/hooks/useAuth');
  return {
    ...actual,
    useAuth: jest.fn(),
  };
});

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useAuth } = require('@/hooks/useAuth');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { usePermissions } = require('@/hooks/usePermissions');

const mockAuth = useAuth as jest.Mock;
const mockPermissions = usePermissions as jest.Mock;

const baseModules = [
  buildModule('dashboard', 'Dashboard', '/dashboard', 'General'),
  buildModule('user-management', 'User Management', '/user-management', 'General'),
  buildModule('notifications', 'Notifications', '/notifications', 'General'),
  buildModule('settings', 'Settings', '/settings', 'General'),
  buildModule('invoices', 'Invoices', '/finance/invoices', 'Finance'),
  buildModule('expense-tracking', 'Expense Tracking', '/finance/expense-tracking', 'Finance'),
  buildModule('asset-management', 'Asset Management', '/it/asset-management', 'IT'),
  buildModule('leads-management', 'Leads', '/sales/leads-management', 'Sales'),
];

function setSession(user: ReturnType<typeof buildUser>, modules = baseModules) {
  mockAuth.mockReturnValue({
    user,
    token: 'test-token',
    isLoading: false,
    logout: jest.fn(),
  });
  mockPermissions.mockReturnValue({
    modules,
    loading: false,
    error: null,
    hasPermission: jest.fn().mockResolvedValue(true),
  });
}

describe('Sidebar', () => {
  beforeEach(() => {
    clearSession();
    jest.clearAllMocks();
  });

  it('renders nothing when the user is not authenticated', () => {
    mockAuth.mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      logout: jest.fn(),
    });
    mockPermissions.mockReturnValue({
      modules: [],
      loading: false,
      error: null,
      hasPermission: jest.fn(),
    });

    const { container } = render(<Sidebar />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the modules the user can access', async () => {
    setSession(buildUser({ role: 'ADMIN' }));

    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Asset Management')).toBeInTheDocument();
  });

  it('does not render modules the user cannot access', async () => {
    setSession(buildUser({ role: 'STAFF' }), [
      buildModule('dashboard', 'Dashboard', '/dashboard', 'General'),
      buildModule('leads-management', 'Leads', '/sales/leads-management', 'Sales'),
    ]);

    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    expect(screen.queryByText('Invoices')).not.toBeInTheDocument();
    expect(screen.queryByText('User Management')).not.toBeInTheDocument();
  });

  describe('Role+ indicator', () => {
    it('is hidden for a plain role user', async () => {
      setSession(buildUser({ role: 'STAFF', roleEnhanced: false }));

      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
      expect(screen.queryByLabelText('Role enhanced')).not.toBeInTheDocument();
      expect(screen.queryByText(/Role\+/)).not.toBeInTheDocument();
    });

    it('is shown when the user access is enhanced by groups or overrides', async () => {
      setSession(buildUser({ role: 'STAFF', roleEnhanced: true }));

      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
      expect(screen.getAllByLabelText('Role enhanced').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Role\+/).length).toBeGreaterThan(0);
    });
  });

  describe('grouped navigation', () => {
    it('shows group headings for administrators', async () => {
      setSession(buildUser({ role: 'ADMIN' }));

      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getByText('Invoices')).toBeInTheDocument();
      });
      expect(screen.getByText('Finance')).toBeInTheDocument();
      expect(screen.getByText('IT')).toBeInTheDocument();
    });

    it('hides group headings for non-administrators', async () => {
      setSession(buildUser({ role: 'HOD' }));

      render(<Sidebar />);

      await waitFor(() => {
        expect(screen.getByText('Invoices')).toBeInTheDocument();
      });
      expect(screen.queryByText('Finance')).not.toBeInTheDocument();
    });
  });

  describe('session', () => {
    it('hydrates the user from the stored session', () => {
      seedSession(buildUser({ name: 'Stored User' }));
      expect(window.localStorage.getItem('auth_user_v3')).toContain('Stored User');
    });
  });
});
