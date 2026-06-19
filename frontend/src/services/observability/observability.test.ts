import { describe, it, expect, vi, beforeEach } from 'vitest';
import { observability, type ObservabilityProvider } from '@/services/observability/observability.service';

describe('observability service', () => {
  const mockProvider: ObservabilityProvider = {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    captureMetric: vi.fn(),
    identifyUser: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    observability.setProvider(mockProvider);
  });

  it('captures exceptions via provider', () => {
    observability.captureException(new Error('test'), { tags: { source: 'unit-test' } });
    expect(mockProvider.captureException).toHaveBeenCalled();
  });

  it('captures metrics via provider', () => {
    observability.captureMetric('test.metric', 1, { ok: 'true' });
    expect(mockProvider.captureMetric).toHaveBeenCalledWith('test.metric', 1, { ok: 'true' });
  });

  it('identifies users via provider', () => {
    observability.identifyUser('user-1', { role: 'ADMIN' });
    expect(mockProvider.identifyUser).toHaveBeenCalledWith('user-1', { role: 'ADMIN' });
  });
});
