import type { AuthUser, Module, Role } from '@/lib/modules';

/**
 * Builds a user object for tests. Defaults match a plain ADMIN user with no
 * group/override enhancements.
 */
export function buildUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-1',
    email: 'admin@claspcrm.com',
    name: 'Test User',
    role: 'ADMIN' as Role,
    roleEnhanced: false,
    isVerified: true,
    tenantId: 'tenant-a',
    department: null,
    managedDepartment: null,
    accessibleModules: [],
    ...overrides,
  };
}

/** Builds a module entry as returned by the backend. */
export function buildModule(
  id: string,
  name: string,
  path: string,
  group?: string,
): Module {
  return {
    id,
    name,
    path,
    icon: 'LayoutDashboard',
    ...(group ? { group } : {}),
  } as Module;
}

/**
 * Seeds `localStorage` with a token + cached user so `useAuth` hydrates
 * without hitting the network.
 */
export function seedSession(user: AuthUser, token = 'test-token'): void {
  window.localStorage.setItem('token', token);
  window.localStorage.setItem('auth_user', JSON.stringify(user));
}

/** Clears any session state between tests. */
export function clearSession(): void {
  window.localStorage.clear();
  document.cookie = 'access_token=; Max-Age=0; path=/';
}
