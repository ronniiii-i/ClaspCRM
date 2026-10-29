import { ACLService } from '@/services/acl';

describe('ACLService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('getEffectivePermissions', () => {
    it('returns the permissions and the enhanced flag', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          permissions: [
            {
              moduleId: 'module-finance',
              permissionType: 'VIEW',
              granted: true,
              sources: [{ type: 'ROLE' }],
            },
          ],
          enhanced: true,
        }),
      }) as unknown as typeof fetch;

      const result = await ACLService.getEffectivePermissions('token');

      expect(result.enhanced).toBe(true);
      expect(result.permissions).toHaveLength(1);
      expect(result.permissions[0].moduleId).toBe('module-finance');
    });

    it('sends the bearer token', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ permissions: [], enhanced: false }),
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      await ACLService.getEffectivePermissions('my-token');

      const [, init] = fetchMock.mock.calls[0];
      expect((init as RequestInit).headers).toMatchObject({
        Authorization: 'Bearer my-token',
      });
    });

    it('throws when the backend rejects the request', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      }) as unknown as typeof fetch;

      await expect(ACLService.getEffectivePermissions('token')).rejects.toThrow(
        /ACL request failed/,
      );
    });
  });

  describe('checkPermission', () => {
    it('returns true when the backend grants the permission', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ hasPermission: true }),
      }) as unknown as typeof fetch;

      await expect(
        ACLService.checkPermission('token', 'module-finance', 'VIEW'),
      ).resolves.toBe(true);
    });

    it('returns false when the backend denies the permission', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ hasPermission: false }),
      }) as unknown as typeof fetch;

      await expect(
        ACLService.checkPermission('token', 'module-finance', 'DELETE'),
      ).resolves.toBe(false);
    });
  });
});
