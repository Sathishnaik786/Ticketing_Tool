export interface ObservabilityContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: 'info' | 'warning' | 'error';
}

export interface ObservabilityProvider {
  captureException(error: unknown, context?: ObservabilityContext): void;
  captureMessage(message: string, context?: ObservabilityContext): void;
  captureMetric(name: string, value: number, tags?: Record<string, string>): void;
  identifyUser(userId: string, traits?: Record<string, unknown>): void;
}

class ConsoleObservabilityProvider implements ObservabilityProvider {
  captureException(error: unknown, context?: ObservabilityContext): void {
    console.error('[observability] exception', error, context);
  }

  captureMessage(message: string, context?: ObservabilityContext): void {
    const fn = context?.level === 'error' ? console.error : console.info;
    fn('[observability]', message, context);
  }

  captureMetric(name: string, value: number, tags?: Record<string, string>): void {
    console.info('[observability] metric', name, value, tags);
  }

  identifyUser(userId: string, traits?: Record<string, unknown>): void {
    console.info('[observability] identify', userId, traits);
  }
}

class NoopObservabilityProvider implements ObservabilityProvider {
  captureException(): void {}
  captureMessage(): void {}
  captureMetric(): void {}
  identifyUser(): void {}
}

export const isObservabilityEnabled =
  import.meta.env.VITE_ENABLE_OBSERVABILITY === 'true';

/** Sentry DSN — empty string means real Sentry is not provisioned yet. */
const SENTRY_DSN: string = import.meta.env.VITE_SENTRY_DSN ?? '';

function createProvider(): ObservabilityProvider {
  if (!isObservabilityEnabled) {
    return new NoopObservabilityProvider();
  }

  // When a real Sentry DSN is configured, we'll initialize @sentry/react.
  // For now we feature-detect the DSN so the branch is ready to activate
  // the moment a DSN is added to .env — no code change required.
  if (SENTRY_DSN) {
    // Dynamic import keeps @sentry/react optional (not installed yet).
    // Un-comment and install @sentry/react when a DSN is provisioned:
    //
    // import * as Sentry from '@sentry/react';
    // Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.2 });
    //
    // Then return a SentryObservabilityProvider that calls Sentry.*  methods.
    //
    // Until then, fall through to ConsoleObservabilityProvider so the branch
    // is harmless and DSN detection is already wired.
    console.info('[observability] Sentry DSN detected — provider will upgrade to @sentry/react once SDK is installed.');
  }

  return new ConsoleObservabilityProvider();
}

let provider: ObservabilityProvider = createProvider();

export const observability = {
  getProvider(): ObservabilityProvider {
    return provider;
  },
  setProvider(next: ObservabilityProvider): void {
    provider = next;
  },
  captureException(error: unknown, context?: ObservabilityContext): void {
    provider.captureException(error, context);
  },
  captureMessage(message: string, context?: ObservabilityContext): void {
    provider.captureMessage(message, context);
  },
  captureMetric(name: string, value: number, tags?: Record<string, string>): void {
    provider.captureMetric(name, value, tags);
  },
  identifyUser(userId: string, traits?: Record<string, unknown>): void {
    provider.identifyUser(userId, traits);
  },
};
