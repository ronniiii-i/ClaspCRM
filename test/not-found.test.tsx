import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import NotFound from '@/app/not-found';

/**
 * 404 branching:
 *   - signed in  → the 404 is rendered inside the dashboard shell
 *   - signed out → the standalone public 404 is rendered
 *   - unknown     → neither is shown while the session is still being restored
 */

jest.mock('@/hooks/useAuth', () => ({ useAuth: jest.fn() }));

jest.mock('@/components/layout/DashboardShell', () => ({
  DashboardShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="dashboard-shell">{children}</div>
  ),
}));

jest.mock('@/components/not-found/DashboardNotFound', () => ({
  DashboardNotFound: () => <div>dashboard-404</div>,
}));

jest.mock('@/components/not-found/PublicNotFound', () => ({
  PublicNotFound: () => <div>public-404</div>,
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useAuth } = require('@/hooks/useAuth');
const mockAuth = useAuth as jest.Mock;

describe('root not-found page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the standalone page for visitors who are not signed in', () => {
    mockAuth.mockReturnValue({ user: null, isLoading: false });

    render(<NotFound />);

    expect(screen.getByText('public-404')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-shell')).not.toBeInTheDocument();
  });

  it('keeps the dashboard shell for signed-in users', () => {
    mockAuth.mockReturnValue({
      user: { id: 'user-1', role: 'ADMIN' },
      isLoading: false,
    });

    render(<NotFound />);

    expect(screen.getByTestId('dashboard-shell')).toBeInTheDocument();
    expect(screen.getByText('dashboard-404')).toBeInTheDocument();
    expect(screen.queryByText('public-404')).not.toBeInTheDocument();
  });

  it('waits for the session before choosing a variant', () => {
    mockAuth.mockReturnValue({ user: null, isLoading: true });

    render(<NotFound />);

    expect(screen.queryByText('public-404')).not.toBeInTheDocument();
    expect(screen.queryByText('dashboard-404')).not.toBeInTheDocument();
  });
});
