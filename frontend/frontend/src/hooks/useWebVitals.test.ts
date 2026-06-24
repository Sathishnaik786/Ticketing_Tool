import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWebVitals } from './useWebVitals';
import * as webVitals from 'web-vitals';
import { recordWebVital } from '@/services/observability/performance.service';

vi.mock('@/services/observability/performance.service', () => ({
  recordWebVital: vi.fn(),
}));

vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}));

describe('useWebVitals hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers web vitals callbacks and records performance metrics on trigger', async () => {
    let clsCallback: any = null;
    let fcpCallback: any = null;
    let inpCallback: any = null;
    let lcpCallback: any = null;
    let ttfbCallback: any = null;

    vi.mocked(webVitals.onCLS).mockImplementation((cb: any) => {
      clsCallback = cb;
    });
    vi.mocked(webVitals.onFCP).mockImplementation((cb: any) => {
      fcpCallback = cb;
    });
    vi.mocked(webVitals.onINP).mockImplementation((cb: any) => {
      inpCallback = cb;
    });
    vi.mocked(webVitals.onLCP).mockImplementation((cb: any) => {
      lcpCallback = cb;
    });
    vi.mocked(webVitals.onTTFB).mockImplementation((cb: any) => {
      ttfbCallback = cb;
    });

    renderHook(() => useWebVitals());

    // Flush promises so the dynamic import loads and registers the callbacks
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(webVitals.onCLS).toHaveBeenCalled();
    expect(webVitals.onFCP).toHaveBeenCalled();
    expect(webVitals.onINP).toHaveBeenCalled();
    expect(webVitals.onLCP).toHaveBeenCalled();
    expect(webVitals.onTTFB).toHaveBeenCalled();

    // Trigger each metric callback and verify recorded values
    if (clsCallback) clsCallback({ value: 0.08, rating: 'good' });
    if (fcpCallback) fcpCallback({ value: 800, rating: 'good' });
    if (inpCallback) inpCallback({ value: 150, rating: 'good' });
    if (lcpCallback) lcpCallback({ value: 2100, rating: 'needs-improvement' });
    if (ttfbCallback) ttfbCallback({ value: 200, rating: 'good' });

    expect(recordWebVital).toHaveBeenCalledWith('CLS', 0.08, 'good');
    expect(recordWebVital).toHaveBeenCalledWith('FCP', 800, 'good');
    expect(recordWebVital).toHaveBeenCalledWith('INP', 150, 'good');
    expect(recordWebVital).toHaveBeenCalledWith('LCP', 2100, 'needs-improvement');
    expect(recordWebVital).toHaveBeenCalledWith('TTFB', 200, 'good');
  });
});
