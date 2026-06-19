import {
  isEtmsUiV2Enabled,
  isEtmsNavigationEnabled,
  isEtmsDashboardEnabled,
  isEtmsNotificationsEnabled,
} from '@/config/features';
import { observability } from '@/services/observability/observability.service';

const STORAGE_KEY = 'ticketra_flag_telemetry';

interface FlagSnapshot {
  flag: string;
  enabled: boolean;
  count: number;
  lastSeen: string;
}

interface TelemetryStore {
  flags: Record<string, FlagSnapshot>;
  sessions: number;
}

function readStore(): TelemetryStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TelemetryStore;
  } catch {
    // ignore
  }
  return { flags: {}, sessions: 0 };
}

function writeStore(store: TelemetryStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

const ETMS_FLAGS = [
  { key: 'ETMS_UI_V2', enabled: isEtmsUiV2Enabled, env: 'VITE_ENABLE_ETMS_UI_V2' },
  { key: 'ETMS_NAVIGATION', enabled: isEtmsNavigationEnabled, env: 'VITE_ENABLE_ETMS_NAVIGATION' },
  { key: 'ETMS_DASHBOARD', enabled: isEtmsDashboardEnabled, env: 'VITE_ENABLE_ETMS_DASHBOARD' },
  { key: 'ETMS_NOTIFICATIONS', enabled: isEtmsNotificationsEnabled, env: 'VITE_ENABLE_ETMS_NOTIFICATIONS' },
] as const;

export function trackFeatureFlags(): void {
  const store = readStore();
  store.sessions += 1;

  for (const flag of ETMS_FLAGS) {
    const existing = store.flags[flag.key] ?? {
      flag: flag.key,
      enabled: flag.enabled,
      count: 0,
      lastSeen: new Date().toISOString(),
    };
    existing.enabled = flag.enabled;
    existing.count += 1;
    existing.lastSeen = new Date().toISOString();
    store.flags[flag.key] = existing;

    observability.captureMetric(`feature_flag.${flag.key.toLowerCase()}`, flag.enabled ? 1 : 0, {
      enabled: String(flag.enabled),
      env: flag.env,
    });
  }

  writeStore(store);
}

export function getFeatureFlagTelemetry(): TelemetryStore {
  return readStore();
}

export function getFeatureFlagRolloutPercent(flagKey: string): number {
  const store = readStore();
  const snap = store.flags[flagKey];
  if (!snap || store.sessions === 0) return 0;
  return Math.round((snap.count / store.sessions) * (snap.enabled ? 100 : 0));
}

export { ETMS_FLAGS };
