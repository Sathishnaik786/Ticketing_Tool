import type { ObservabilityProvider } from './observability.service';
import { observability } from './observability.service';

/** Sentry-compatible adapter — wire DSN when enterprise Sentry is provisioned. */
export class SentryObservabilityProvider implements ObservabilityProvider {
  captureException(error: unknown, context?: Parameters<ObservabilityProvider['captureException']>[1]): void {
    observability.captureException(error, { ...context, tags: { ...context?.tags, provider: 'sentry' } });
  }

  captureMessage(message: string, context?: Parameters<ObservabilityProvider['captureMessage']>[1]): void {
    observability.captureMessage(message, { ...context, tags: { ...context?.tags, provider: 'sentry' } });
  }

  captureMetric(name: string, value: number, tags?: Record<string, string>): void {
    observability.captureMetric(name, value, { ...tags, provider: 'sentry' });
  }

  identifyUser(userId: string, traits?: Record<string, unknown>): void {
    observability.identifyUser(userId, traits);
  }
}

export const sentryProvider = new SentryObservabilityProvider();
