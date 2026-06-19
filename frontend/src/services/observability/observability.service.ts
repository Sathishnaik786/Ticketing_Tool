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

function createProvider(): ObservabilityProvider {
  if (!isObservabilityEnabled) {
    return new NoopObservabilityProvider();
  }
  if (import.meta.env.DEV) {
    return new ConsoleObservabilityProvider();
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
