import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/(dashboard-pages)/dashboard/page';

/**
 * Role/department dispatch for the dashboard.
 *
 * The heavy widget bundles are mocked so this suite asserts exactly one thing:
 * the page chooses the right view for the authenticated user's role and the
 * canonical department type. That is the contract the department-specific
 * dashboards (Finance/Accounting, IT, Sales, Support, HR) depend on.
 */

jest.mock('@/hooks/useAuth', () => ({ useAuth: jest.fn() }));

jest.mock(
  '@/app/(dashboard-pages)/dashboard/_hooks/use-dashboard-data',
  () => ({
    useDashboardData: jest.fn(),
    Department: {
      FINANCE: 'FINANCE',
      ACCOUNTING: 'ACCOUNTING',
      IT: 'INFORMATION_TECHNOLOGY',
      SALES: 'SALES',
      CUSTOMER_SUPPORT: 'CUSTOMER_SERVICE',
      HR: 'HUMAN_RESOURCES',
      ADMINISTRATION: 'ADMINISTRATION',
      OPERATIONS: 'OPERATIONS',
    },
  }),
);

jest.mock('@/app/(dashboard-pages)/dashboard/_components/skeleton', () => ({
  DashboardSkeleton: () => <div>dashboard-skeleton</div>,
}));
jest.mock('@/app/(dashboard-pages)/dashboard/_components/admin_view', () => ({
  AdminDashboard: () => <div>admin-view</div>,
}));
jest.mock('@/app/(dashboard-pages)/dashboard/_components/lead-view', () => ({
  TeamLeadDashboard: ({ teamId }: { teamId: string }) => (
    <div>lead-view:{teamId}</div>
  ),
}));
jest.mock('@/app/(dashboard-pages)/dashboard/_components/staff-view', () => ({
  StaffDashboard: ({ userId }: { userId: string }) => (
    <div>staff-view:{userId}</div>
  ),
}));
jest.mock('@/app/(dashboard-pages)/dashboard/_components/hod-view', () => ({
  HodDashboard: ({ department }: { department?: string }) => (
    <div>generic-hod-view:{department ?? 'none'}</div>
  ),
}));
jest.mock(
  '@/app/(dashboard-pages)/dashboard/_components/finance-hod-view',
  () => ({
    FinanceHodDashboard: ({ department }: { department?: string }) => (
      <div>finance-view:{department}</div>
    ),
  }),
);
jest.mock('@/app/(dashboard-pages)/dashboard/_components/it-hod-view', () => ({
  ItHodDashboard: () => <div>it-view</div>,
}));
jest.mock('@/app/(dashboard-pages)/dashboard/_components/hr-hod-view', () => ({
  HrHodDashboard: () => <div>hr-view</div>,
}));
jest.mock(
  '@/app/(dashboard-pages)/dashboard/_components/sales-hod-view',
  () => ({
    SalesHodDashboard: () => <div>sales-view</div>,
  }),
);
jest.mock(
  '@/app/(dashboard-pages)/dashboard/_components/support-hod-view',
  () => ({
    SupportHodDashboard: () => <div>support-view</div>,
  }),
);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useAuth } = require('@/hooks/useAuth');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useDashboardData } = require('@/app/(dashboard-pages)/dashboard/_hooks/use-dashboard-data');

const mockAuth = useAuth as jest.Mock;
const mockDashboardData = useDashboardData as jest.Mock;

function signInAs(
  overrides: {
    role?: string;
    department?: { id: string; name: string; type?: string } | null;
    managedDepartment?: { id: string; name: string; type?: string } | null;
  } = {},
) {
  const user = {
    id: 'user-1',
    email: 'user@claspcrm.com',
    name: 'Test User',
    role: overrides.role ?? 'STAFF',
    isVerified: true,
    tenantId: 'tenant-a',
    department: overrides.department ?? null,
    managedDepartment: overrides.managedDepartment ?? null,
    accessibleModules: [],
  };

  mockAuth.mockReturnValue({ user, token: 'token', isLoading: false });
  mockDashboardData.mockReturnValue({
    data: {},
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    isEmpty: false,
  });
}

describe('dashboard role dispatch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the skeleton while the session is still loading', () => {
    mockAuth.mockReturnValue({ user: null, token: null, isLoading: true });
    mockDashboardData.mockReturnValue({ isLoading: true });

    render(<DashboardPage />);

    expect(screen.getByText('dashboard-skeleton')).toBeInTheDocument();
  });

  it('renders the admin view for administrators', () => {
    signInAs({ role: 'ADMIN' });

    render(<DashboardPage />);

    expect(screen.getByText('admin-view')).toBeInTheDocument();
  });

  it('renders the finance view for a Finance HOD', () => {
    signInAs({
      role: 'HOD',
      department: { id: 'dept-fin', name: 'Finance', type: 'FINANCE' },
    });

    render(<DashboardPage />);

    expect(screen.getByText('finance-view:FINANCE')).toBeInTheDocument();
  });

  it('renders the finance view scoped to Accounting for an Accounting HOD', () => {
    signInAs({
      role: 'HOD',
      department: {
        id: 'dept-acc',
        name: 'Accounting',
        type: 'ACCOUNTING',
      },
    });

    render(<DashboardPage />);

    expect(screen.getByText('finance-view:ACCOUNTING')).toBeInTheDocument();
  });

  it('renders the IT view for an IT HOD and never the finance view', () => {
    signInAs({
      role: 'HOD',
      department: {
        id: 'dept-it',
        name: 'Information Technology',
        type: 'INFORMATION_TECHNOLOGY',
      },
    });

    render(<DashboardPage />);

    expect(screen.getByText('it-view')).toBeInTheDocument();
    expect(screen.queryByText(/finance-view/)).not.toBeInTheDocument();
  });

  it('renders the HR view for an HR HOD', () => {
    signInAs({
      role: 'HOD',
      department: {
        id: 'dept-hr',
        name: 'Human Resources',
        type: 'HUMAN_RESOURCES',
      },
    });

    render(<DashboardPage />);

    expect(screen.getByText('hr-view')).toBeInTheDocument();
  });

  it('renders the sales view for a Sales HOD', () => {
    signInAs({
      role: 'HOD',
      department: { id: 'dept-sales', name: 'Sales', type: 'SALES' },
    });

    render(<DashboardPage />);

    expect(screen.getByText('sales-view')).toBeInTheDocument();
  });

  it('renders the support view for a Customer Support HOD', () => {
    signInAs({
      role: 'HOD',
      department: {
        id: 'dept-support',
        name: 'Customer Support',
        type: 'CUSTOMER_SERVICE',
      },
    });

    render(<DashboardPage />);

    expect(screen.getByText('support-view')).toBeInTheDocument();
  });

  it('falls back to the generic department view for an unknown department', () => {
    signInAs({
      role: 'HOD',
      department: { id: 'dept-ops', name: 'Operations', type: 'OPERATIONS' },
    });

    render(<DashboardPage />);

    expect(
      screen.getByText('generic-hod-view:OPERATIONS'),
    ).toBeInTheDocument();
  });

  it('prefers the canonical department type over a renamed display name', () => {
    signInAs({
      role: 'HOD',
      // Tenants can rename departments, but the type stays canonical.
      department: { id: 'dept-fin', name: 'Money Stuff', type: 'FINANCE' },
    });

    render(<DashboardPage />);

    expect(screen.getByText('finance-view:FINANCE')).toBeInTheDocument();
  });

  it('renders the team view for a lead', () => {
    signInAs({ role: 'LEAD' });

    render(<DashboardPage />);

    expect(screen.getByText('lead-view:user-1')).toBeInTheDocument();
  });

  it('renders the personal view for staff', () => {
    signInAs({ role: 'STAFF' });

    render(<DashboardPage />);

    expect(screen.getByText('staff-view:user-1')).toBeInTheDocument();
  });
});
