import { useEffect } from 'react';
import { recordWebVital } from '@/services/observability/performance.service';

type Metric = { name: string; value: number; rating?: string };

async function loadWebVitals(onReport: (metric: Metric) => void) {
  try {
    const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals');
    onCLS((m) => onReport({ name: 'CLS', value: m.value, rating: m.rating }));
    onFCP((m) => onReport({ name: 'FCP', value: m.value, rating: m.rating }));
    onINP((m) => onReport({ name: 'INP', value: m.value, rating: m.rating }));
    onLCP((m) => onReport({ name: 'LCP', value: m.value, rating: m.rating }));
    onTTFB((m) => onReport({ name: 'TTFB', value: m.value, rating: m.rating }));
  } catch {
    // web-vitals optional in test env
  }
}

/** Capture Core Web Vitals once per session. */
export function useWebVitals(): void {
  useEffect(() => {
    loadWebVitals((metric) => {
      recordWebVital(metric.name as 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB', metric.value, metric.rating);
    });
  }, []);
}
