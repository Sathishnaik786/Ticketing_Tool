import { observability } from './observability.service';

const THRESHOLDS = {
  LCP: 2500,
  CLS: 0.1,
  INP: 200,
  FCP: 1800,
  TTFB: 800,
} as const;

export type WebVitalName = keyof typeof THRESHOLDS;

export function recordWebVital(name: WebVitalName, value: number, rating?: string): void {
  observability.captureMetric(`web_vital.${name.toLowerCase()}`, value, {
    rating: rating ?? (value <= THRESHOLDS[name] ? 'good' : 'poor'),
  });

  if (import.meta.env.DEV) {
    const target = THRESHOLDS[name];
    const status = value <= target ? '✓' : '⚠';
    console.info(`[web-vitals] ${status} ${name}: ${value.toFixed(2)} (target ≤ ${target})`);
  }
}

export { THRESHOLDS as WEB_VITAL_THRESHOLDS };
