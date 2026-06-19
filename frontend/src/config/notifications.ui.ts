import {
  isEtmsNotificationsEnabled,
  isNotificationCenterEnabled,
} from './features';

/** Unified ETMS notification bell requires both flags. */
export function useUnifiedNotificationsUi(): boolean {
  return isEtmsNotificationsEnabled && isNotificationCenterEnabled;
}
