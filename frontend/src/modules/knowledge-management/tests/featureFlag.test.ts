import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('knowledge base feature flag', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns no routes when flag is off', async () => {
    vi.stubEnv('VITE_ENABLE_KNOWLEDGE_BASE', 'false');
    const { knowledgeManagementRoutes } = await import('../knowledge-management.routes');
    expect(knowledgeManagementRoutes).toEqual([]);
  });

  it('returns routes when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_KNOWLEDGE_BASE', 'true');
    const { knowledgeManagementRoutes } = await import('../knowledge-management.routes');
    expect(knowledgeManagementRoutes.length).toBe(4);
    expect(knowledgeManagementRoutes.map((r) => r.path)).toEqual([
      'knowledge-base',
      'articles/:id',
      'article-editor',
      'kb-analytics',
    ]);
  });

  it('returns no nav when flag is off', async () => {
    vi.stubEnv('VITE_ENABLE_KNOWLEDGE_BASE', 'false');
    const { filterNavItem } = await import('@/config/navigation.utils');
    const { NAV_ITEMS } = await import('@/config/navigation');
    const items = NAV_ITEMS.filter((i) => i.featureFlag === 'VITE_ENABLE_KNOWLEDGE_BASE');
    expect(items.every((item) => !filterNavItem(item, { role: 'ADMIN' }))).toBe(true);
  });

  it('returns nav groups when flag is on', async () => {
    vi.stubEnv('VITE_ENABLE_KNOWLEDGE_BASE', 'true');
    const { buildEtmsNavGroups } = await import('@/config/navigation.utils');
    const group = buildEtmsNavGroups().find((g) => g.id === 'knowledge-base');
    expect(group?.label).toBe('Knowledge Base');
    expect(group?.items.length).toBeGreaterThan(0);
  });

  it('uses strict true comparison', async () => {
    vi.stubEnv('VITE_ENABLE_KNOWLEDGE_BASE', 'TRUE');
    const { isKnowledgeBaseEnabled } = await import('@/config/features');
    expect(isKnowledgeBaseEnabled).toBe(false);
  });

  it('knowledge-base route has element defined', async () => {
    vi.stubEnv('VITE_ENABLE_KNOWLEDGE_BASE', 'true');
    const { knowledgeManagementRoutes } = await import('../knowledge-management.routes');
    const route = knowledgeManagementRoutes.find((r) => r.path === 'knowledge-base');
    expect(route?.element).toBeTruthy();
  });
});
