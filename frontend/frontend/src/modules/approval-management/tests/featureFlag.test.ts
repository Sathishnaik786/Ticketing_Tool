import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('approval engine feature flag', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns no routes when flag is off', async () => {
    vi.stubEnv('VITE_ENABLE_APPROVAL_ENGINE', 'false');
    const { approvalManagementRoutes } = await import('../approval-management.routes');
    expect(approvalManagementRoutes).toEqual([]);
  });

  it('returns routes when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_APPROVAL_ENGINE', 'true');
    const { approvalManagementRoutes } = await import('../approval-management.routes');
    expect(approvalManagementRoutes.length).toBe(3);
    expect(approvalManagementRoutes.map((r) => r.path)).toEqual([
      'approvals',
      'my-approvals',
      'approval-analytics',
    ]);
  });

  it('returns no nav when flag is off', async () => {
    vi.stubEnv('VITE_ENABLE_APPROVAL_ENGINE', 'false');
    const { filterNavItem } = await import('@/config/navigation.utils');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const items = NAV_ITEMS.filter((i) => i.featureFlag === 'VITE_ENABLE_APPROVAL_ENGINE');
    expect(items.every((item) => !filterNavItem(item, { role: 'ADMIN' }))).toBe(true);
  });

  it('returns nav groups when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_APPROVAL_ENGINE', 'true');
    const { buildEtmsNavGroups } = await import('@/config/navigation.utils');
    const group = buildEtmsNavGroups().find((g) => g.id === 'approvals');
    expect(group?.label).toBe('Approvals');
    expect(group?.items.length).toBeGreaterThan(0);
  });

  it('uses strict true comparison', async () => {
    vi.stubEnv('VITE_ENABLE_APPROVAL_ENGINE', 'TRUE');
    const { isApprovalEngineEnabled } = await import('@/config/features');
    expect(isApprovalEngineEnabled).toBe(false);
  });

  it('approvals route has element defined', async () => {
    vi.stubEnv('VITE_ENABLE_APPROVAL_ENGINE', 'true');
    const { approvalManagementRoutes } = await import('../approval-management.routes');
    const route = approvalManagementRoutes.find((r) => r.path === 'approvals');
    expect(route?.element).toBeTruthy();
  });
});
