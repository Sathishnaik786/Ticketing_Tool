import { describe, it, expect, vi } from 'vitest';
import { fetchEtmsDashboardStats } from '@/modules/dashboard/services/etmsDashboardService';

vi.mock('@/modules/dashboard/services/etmsDashboardApi', () => ({
  fetchDashboardKpis: vi.fn().mockResolvedValue(null),
  fetchDashboardSla: vi.fn().mockResolvedValue(null),
  fetchDashboardActivity: vi.fn().mockResolvedValue(null),
}));

describe('etms dashboard service', () => {
  it('falls back to demo data when API unavailable', async () => {
    const stats = await fetchEtmsDashboardStats();
    expect(stats.isDemoData).toBe(true);
    expect(stats.totalTickets).toBeGreaterThan(0);
  });
});
