import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NAV_ITEMS } from './navigation';
import { buildEtmsNavGroups, buildLegacyNavGroups, filterByNavMode } from './navigation.utils';

const FLAG_KEYS = [
  'VITE_ENABLE_ETMS_UI_V2',
  'VITE_ENABLE_ETMS_NAVIGATION',
  'VITE_ENABLE_ETMS_DASHBOARD',
  'VITE_ENABLE_ETMS_NOTIFICATIONS',
] as const;

function setFlags(combo: Record<string, string>) {
  for (const key of FLAG_KEYS) {
    vi.stubEnv(key, combo[key] ?? 'false');
  }
}

describe('ETMS feature flag matrix', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const combinations: Record<string, string>[] = [];
  for (let i = 0; i < 16; i++) {
    const combo: Record<string, string> = {};
    FLAG_KEYS.forEach((key, bit) => {
      combo[key] = i & (1 << bit) ? 'true' : 'false';
    });
    combinations.push(combo);
  }

  it.each(combinations.map((c, i) => [i, c] as const))(
    'combination %i builds nav without crash',
    async (_idx, combo) => {
      setFlags(combo);
      vi.resetModules();
      const utils = await import('./navigation.utils');
      expect(() => utils.buildEtmsNavGroups()).not.toThrow();
      expect(() => utils.buildLegacyNavGroups()).not.toThrow();
      expect(utils.buildEtmsNavGroups().length).toBeGreaterThan(0);
      expect(utils.buildLegacyNavGroups().length).toBeGreaterThan(0);
    }
  );
});

describe('payroll approvals href', () => {
  it('points to governance approvals route', () => {
    const item = NAV_ITEMS.find((i) => i.id === 'legacy-payroll-approvals');
    expect(item?.href).toBe('/app/payroll/governance/approvals');
  });
});

describe('filterByNavMode', () => {
  it('excludes legacy alias items in ETMS mode', () => {
    const items = NAV_ITEMS.map((i) => ({ id: i.id }));
    const filtered = filterByNavMode(items, true);
    expect(filtered.some((i) => i.id === 'tickets-legacy-list')).toBe(false);
  });
});

describe('operator dashboard in ETMS nav', () => {
  it('is included in dashboard group', () => {
    const groups = buildEtmsNavGroups();
    const dashboard = groups.find((g) => g.id === 'dashboard');
    expect(dashboard?.items.some((i) => i.id === 'operator-dashboard')).toBe(true);
  });
});
