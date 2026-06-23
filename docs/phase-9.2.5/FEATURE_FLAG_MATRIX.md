# Feature Flag Matrix — Phase 9.2.5

This document lists environment feature flags in `features.ts` and `.env` files, classifying them as permanent, temporary, or legacy.

## Feature Flag Classifications

| Environment Variable | Flag Code Name | Type | Current Default | ALWAYS-ON Target? | Recommendation |
|---|---|---|---|---|---|
| `VITE_ENABLE_TICKETING` | `isTicketingEnabled` | Permanent | `true` | Yes | Always-ON candidate. Ticketing is the primary module of ETMS. |
| `VITE_ENABLE_TICKET_ASSIGNMENTS` | `isTicketAssignmentsEnabled` | Permanent | `true` | Yes | Always-ON candidate. Key core queue workflow. |
| `VITE_ENABLE_APPROVAL_ENGINE` | `isApprovalEngineEnabled` | Permanent | `true` | Yes | Always-ON candidate. Governs approvals catalog. |
| `VITE_ENABLE_KNOWLEDGE_BASE` | `isKnowledgeBaseEnabled` | Permanent | `true` | Yes | Always-ON candidate. KB Hub. |
| `VITE_ENABLE_NOTIFICATION_CENTER`| `isNotificationCenterEnabled`| Permanent | `true` | Yes | Always-ON candidate. Alerts engine. |
| `VITE_ENABLE_COMMUNICATION_TRACKING`| `isCommunicationTrackingEnabled`| Permanent | `true` | Yes | Always-ON candidate. Timeline communications tracking. |
| `VITE_ENABLE_TICKET_FEEDBACK` | `isTicketFeedbackEnabled` | Permanent | `true` | Yes | Always-ON candidate. CSAT metric collection. |
| `VITE_ENABLE_EXECUTIVE_ANALYTICS`| `isExecutiveAnalyticsEnabled`| Permanent | `true` | Yes | Always-ON candidate. BI charts. |
| `VITE_ENABLE_ETMS_UI_V2` | `isEtmsUiV2Enabled` | Temporary | `true` | Yes | Master switch for styling tokens. Safe to lock as always-on. |
| `VITE_ENABLE_ETMS_NAVIGATION` | `isEtmsNavigationEnabled` | Temporary | `true` | Yes | Secondary nav list. Safe to lock as always-on. |
| `VITE_ENABLE_ETMS_DASHBOARD` | `isEtmsDashboardEnabled` | Temporary | `true` | Yes | Command center widget. Safe to lock as always-on. |
| `VITE_ENABLE_ETMS_NOTIFICATIONS` | `isEtmsNotificationsEnabled`| Temporary | `true` | Yes | Unified header bell UI. Safe to lock as always-on. |
| `VITE_ENABLE_DAILY_UPDATES` | — | Legacy | `true` | No | Legacy Updates. Retain only for backup/rollback purposes. |

## Strategy for Future Phase Always-ON Promotion
Once Phase 9.2.5 has completed successfully and UAT verifies ETMS UI stability:
1. Hardcode temporary UI/Navigation flag evaluations to `true` in `features.ts`.
2. Clean up conditional branches gating components (e.g. remove `if (isEtmsUiV2Enabled)` and keep V2 code blocks only).
3. Safely deprecate environmental flags from `.env` configurations.
