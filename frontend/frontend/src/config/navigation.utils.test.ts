import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildEtmsNavGroups,
  buildLegacyNavGroups,
  filterNavGroups,
  getDefaultExpandedSections,
  isNavItemActive,
  loadSidebarExpandedSections,
  SIDEBAR_SECTIONS_KEY,
} from '@/config/navigation.utils';
import { NAV_ITEMS, LEGACY_NAV_GROUP_LABEL } from '@/config/navigation';

describe('navigation.utils', () => {
  const adminUser = { role: 'ADMIN' };
  const employeeUser = { role: 'EMPLOYEE' };

  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv('VITE_ENABLE_TICKETING', 'true');
    vi.stubEnv('VITE_ENABLE_ETMS_NAVIGATION', 'true');
  });

  it('buildEtmsNavGroups puts Dashboard first and legacy HR group last', () => {
    const groups = buildEtmsNavGroups();
    expect(groups[0]?.id).toBe('dashboard');
    expect(groups[groups.length - 1]?.id).toBe('legacy-ems');
    expect(groups[groups.length - 1]?.isLegacy).toBe(true);
  });

  it('legacy HR group is collapsed by default in ETMS mode', () => {
    const defaults = getDefaultExpandedSections(true);
    expect(defaults[LEGACY_NAV_GROUP_LABEL]).toBe(false);
  });

  it('filterNavGroups hides admin-only items from employees', () => {
    const groups = filterNavGroups(buildEtmsNavGroups(), employeeUser);
    const adminGroup = groups.find((g) => g.id === 'administration');
    expect(adminGroup).toBeUndefined();
  });

  it('filterNavGroups shows administration for admin', () => {
    const groups = filterNavGroups(buildEtmsNavGroups(), adminUser);
    const adminGroup = groups.find((g) => g.id === 'administration');
    expect(adminGroup).toBeDefined();
    expect(adminGroup?.items.some((i) => i.id === 'admin-users')).toBe(true);
  });

  it('isNavItemActive matches query scope params', () => {
    const item = { id: 't', title: 'My', href: '/app/tickets?scope=mine', icon: () => null };
    expect(isNavItemActive(item, '/app/tickets', '?scope=mine')).toBe(true);
    expect(isNavItemActive(item, '/app/tickets', '?scope=team')).toBe(false);
  });

  it('migrates legacy sidebar localStorage key', () => {
    localStorage.setItem('yvi_sidebar_sections', JSON.stringify({ 'Legacy EMS': true }));
    const sections = loadSidebarExpandedSections(true);
    expect(sections[LEGACY_NAV_GROUP_LABEL]).toBe(true);
    expect(localStorage.getItem(SIDEBAR_SECTIONS_KEY)).toBeTruthy();
  });

  it('legacy payroll approvals href is valid', () => {
    const item = NAV_ITEMS.find((i) => i.id === 'legacy-payroll-approvals');
    expect(item?.href).toBe('/app/payroll/governance/approvals');
  });
});
