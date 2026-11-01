import type { Module } from '@/lib/modules';
import {
  findActiveGroupKey,
  groupModules,
  isModuleActive,
  stripTenantPrefix,
} from '@/lib/workspace-navigation';
import { buildModule } from './utils/factories';

function department(key: string, name: string, sortOrder: number) {
  return { id: `dept-${key}`, key, name, sortOrder };
}

describe('workspace navigation', () => {
  it('groups by department sort order and sorts modules by order', () => {
    const modules: Module[] = [
      buildModule('invoices', 'Invoices', '/dept/finance/invoices', 'Finance', {
        department: department('finance', 'Finance', 2),
        order: 2,
      }),
      buildModule('leads', 'Leads', '/dept/sales/leads', 'Sales', {
        department: department('sales', 'Sales', 1),
        order: 1,
      }),
      buildModule('expenses', 'Expenses', '/dept/finance/expenses', 'Finance', {
        department: department('finance', 'Finance', 2),
        order: 1,
      }),
    ];

    const groups = groupModules(modules);

    expect(groups.map((group) => group.key)).toEqual(['sales', 'finance']);
    expect(groups[1].modules.map((module) => module.key)).toEqual([
      'expenses',
      'invoices',
    ]);
  });

  it('places global workspace modules before departments', () => {
    const modules = [
      buildModule('invoices', 'Invoices', '/dept/finance/invoices', 'Finance', {
        department: department('finance', 'Finance', 2),
        order: 1,
      }),
      buildModule('dashboard', 'Dashboard', '/dashboard', 'Workspace', {
        order: 1,
      }),
    ];

    const groups = groupModules(modules);

    expect(groups[0].key).toBe('workspace');
    expect(groups[0].modules.map((module) => module.name)).toEqual([
      'Dashboard',
    ]);
  });

  it('derives a department group from a legacy path when metadata is absent', () => {
    const groups = groupModules([
      buildModule('invoices', 'Invoices', '/finance/invoices', 'Finance'),
    ]);

    expect(groups[0]).toMatchObject({ key: 'finance', name: 'Finance' });
  });

  it('strips the tenant prefix before matching the active module', () => {
    const pathname = stripTenantPrefix('/acme/dept/finance/invoices', 'acme');

    expect(pathname).toBe('/dept/finance/invoices');
    expect(isModuleActive(pathname, '/dept/finance/invoices')).toBe(true);
    expect(isModuleActive(pathname, '/dept/finance/expenses')).toBe(false);
  });

  it('finds the active group', () => {
    const groups = groupModules([
      buildModule('dashboard', 'Dashboard', '/dashboard', 'Workspace'),
      buildModule('invoices', 'Invoices', '/dept/finance/invoices', 'Finance', {
        department: department('finance', 'Finance', 2),
      }),
    ]);

    expect(findActiveGroupKey(groups, '/dept/finance/invoices')).toBe('finance');
    expect(findActiveGroupKey(groups, '/profile')).toBeNull();
  });
});
