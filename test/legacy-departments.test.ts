import { getLegacyDepartmentPath } from '@/lib/legacy-departments';

describe('legacy department redirects', () => {
  it('maps old department roots under /dept', () => {
    expect(getLegacyDepartmentPath('/finance/invoices')).toBe(
      '/dept/finance/invoices',
    );
    expect(getLegacyDepartmentPath('/hr/onboarding')).toBe(
      '/dept/human_resources/onboarding',
    );
    expect(getLegacyDepartmentPath('/customer-support/tickets')).toBe(
      '/dept/customer_support/tickets',
    );
  });

  it('preserves the rest of the path', () => {
    expect(getLegacyDepartmentPath('/it/asset-management/abc')).toBe(
      '/dept/information_technology/asset-management/abc',
    );
  });

  it('leaves canonical and unrelated paths alone', () => {
    expect(getLegacyDepartmentPath('/dept/finance/invoices')).toBeNull();
    expect(getLegacyDepartmentPath('/dashboard')).toBeNull();
    expect(getLegacyDepartmentPath('/')).toBeNull();
  });
});
