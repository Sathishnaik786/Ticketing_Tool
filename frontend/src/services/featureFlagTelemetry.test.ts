import { describe, it, expect, beforeEach } from 'vitest';
import { trackFeatureFlags, getFeatureFlagTelemetry, ETMS_FLAGS } from '@/services/featureFlagTelemetry.service';

describe('feature flag telemetry', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('tracks all ETMS flags on session', () => {
    trackFeatureFlags();
    const store = getFeatureFlagTelemetry();
    expect(store.sessions).toBe(1);
    for (const flag of ETMS_FLAGS) {
      expect(store.flags[flag.key]).toBeDefined();
    }
  });

  it('increments session count on repeated tracking', () => {
    trackFeatureFlags();
    trackFeatureFlags();
    expect(getFeatureFlagTelemetry().sessions).toBe(2);
  });
});
