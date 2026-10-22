import { login, getToken, logout } from '@/lib/auth';
import { buildUser, clearSession } from './utils/factories';

describe('auth session', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    clearSession();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('login', () => {
    it('stores the token and the user in localStorage', async () => {
      const user = buildUser({
        role: 'STAFF',
        email: 'staff@claspcrm.com',
      });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: 'jwt-token',
          user: { ...user, accessibleModules: [] },
        }),
      }) as unknown as typeof fetch;

      await login('staff@claspcrm.com', 'Password123!');

      expect(window.localStorage.getItem('token')).toBe('jwt-token');
      expect(window.localStorage.getItem('auth_user')).toContain(
        'staff@claspcrm.com',
      );
    });

    it('preserves the Role+ indicator through the session', async () => {
      const user = buildUser({ role: 'STAFF', roleEnhanced: true });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: 'jwt-token',
          user: { ...user, accessibleModules: [] },
        }),
      }) as unknown as typeof fetch;

      await login('staff@claspcrm.com', 'Password123!');

      const stored = JSON.parse(window.localStorage.getItem('auth_user') as string);
      expect(stored.roleEnhanced).toBe(true);
    });

    it('preserves the tenant id through the session', async () => {
      const user = buildUser({ tenantId: 'tenant-abc' });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: 'jwt-token',
          user: { ...user, accessibleModules: [] },
        }),
      }) as unknown as typeof fetch;

      await login('admin@claspcrm.com', 'Password123!');

      const stored = JSON.parse(window.localStorage.getItem('auth_user') as string);
      expect(stored.tenantId).toBe('tenant-abc');
    });

    it('throws when the backend rejects the credentials', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      }) as unknown as typeof fetch;

      await expect(
        login('staff@claspcrm.com', 'wrong-password'),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getToken', () => {
    it('returns null when nothing is stored', () => {
      expect(getToken()).toBeNull();
    });

    it('returns the stored token', () => {
      window.localStorage.setItem('token', 'abc');
      expect(getToken()).toBe('abc');
    });
  });

  describe('logout', () => {
    it('clears the token and the cached user', async () => {
      window.localStorage.setItem('token', 'abc');
      window.localStorage.setItem('auth_user', '{}');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }) as unknown as typeof fetch;

      await logout();

      expect(window.localStorage.getItem('token')).toBeNull();
      expect(window.localStorage.getItem('auth_user')).toBeNull();
    });
  });
});
