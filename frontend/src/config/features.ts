/**
 * ETMS UI transformation feature flags.
 * All default false — existing behavior preserved until explicitly enabled.
 */
export const isTicketingEnabled =
  import.meta.env.VITE_ENABLE_TICKETING === 'true';

export const isTicketFeedbackEnabled =
  import.meta.env.VITE_ENABLE_TICKET_FEEDBACK === 'true';

export const isTicketAssignmentsEnabled =
  import.meta.env.VITE_ENABLE_TICKET_ASSIGNMENTS === 'true';

export const isCommunicationTrackingEnabled =
  import.meta.env.VITE_ENABLE_COMMUNICATION_TRACKING === 'true';

export const isApprovalEngineEnabled =
  import.meta.env.VITE_ENABLE_APPROVAL_ENGINE === 'true';

export const isKnowledgeBaseEnabled =
  import.meta.env.VITE_ENABLE_KNOWLEDGE_BASE === 'true';

export const isExecutiveAnalyticsEnabled =
  import.meta.env.VITE_ENABLE_EXECUTIVE_ANALYTICS === 'true';

export const isNotificationCenterEnabled =
  import.meta.env.VITE_ENABLE_NOTIFICATION_CENTER === 'true';

/** Master switch for ETMS shell styling (tokens, branding). */
export const isEtmsUiV2Enabled =
  import.meta.env.VITE_ENABLE_ETMS_UI_V2 === 'true';

/** ETMS-primary sidebar + legacy HR group collapsed by default. */
export const isEtmsNavigationEnabled =
  import.meta.env.VITE_ENABLE_ETMS_NAVIGATION === 'true';

/** ETMS Command Dashboard widgets. */
export const isEtmsDashboardEnabled =
  import.meta.env.VITE_ENABLE_ETMS_DASHBOARD === 'true';

/** Unified notification center UI. */
export const isEtmsNotificationsEnabled =
  import.meta.env.VITE_ENABLE_ETMS_NOTIFICATIONS === 'true';

/** Enterprise observability (errors, metrics, analytics). */
export const isObservabilityEnabled =
  import.meta.env.VITE_ENABLE_OBSERVABILITY === 'true';

/** Resolve a feature-flag key from the navigation registry. Unknown flags default false (safe). */
export function isFeatureFlagEnabled(flag?: string): boolean {
  if (!flag) return true;
  const map: Record<string, boolean> = {
    VITE_ENABLE_TICKETING: isTicketingEnabled,
    VITE_ENABLE_TICKET_FEEDBACK: isTicketFeedbackEnabled,
    VITE_ENABLE_TICKET_ASSIGNMENTS: isTicketAssignmentsEnabled,
    VITE_ENABLE_COMMUNICATION_TRACKING: isCommunicationTrackingEnabled,
    VITE_ENABLE_APPROVAL_ENGINE: isApprovalEngineEnabled,
    VITE_ENABLE_KNOWLEDGE_BASE: isKnowledgeBaseEnabled,
    VITE_ENABLE_EXECUTIVE_ANALYTICS: isExecutiveAnalyticsEnabled,
    VITE_ENABLE_NOTIFICATION_CENTER: isNotificationCenterEnabled,
    VITE_ENABLE_ETMS_UI_V2: isEtmsUiV2Enabled,
    VITE_ENABLE_ETMS_NAVIGATION: isEtmsNavigationEnabled,
    VITE_ENABLE_ETMS_DASHBOARD: isEtmsDashboardEnabled,
    VITE_ENABLE_ETMS_NOTIFICATIONS: isEtmsNotificationsEnabled,
    VITE_ENABLE_OBSERVABILITY: isObservabilityEnabled,
    VITE_ENABLE_DAILY_UPDATES: import.meta.env.VITE_ENABLE_DAILY_UPDATES !== 'false',
    VITE_ENABLE_WEEKLY_UPDATES: import.meta.env.VITE_ENABLE_WEEKLY_UPDATES !== 'false',
    VITE_ENABLE_MONTHLY_UPDATES: import.meta.env.VITE_ENABLE_MONTHLY_UPDATES !== 'false',
    VITE_ENABLE_UPDATE_ANALYTICS: import.meta.env.VITE_ENABLE_UPDATE_ANALYTICS !== 'false',
  };
  return map[flag] ?? false;
}
