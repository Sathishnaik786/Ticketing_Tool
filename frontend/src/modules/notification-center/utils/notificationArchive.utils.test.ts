import { describe, it, expect, beforeEach } from 'vitest';
import {
  getArchivedNotificationIds,
  archiveNotificationIds,
  filterArchivedNotifications,
  clearArchivedNotifications,
} from './notificationArchive.utils';

describe('notificationArchive.utils', () => {
  beforeEach(() => {
    clearArchivedNotifications();
  });

  it('archives and filters notifications', () => {
    archiveNotificationIds(['n1', 'n2']);
    expect(getArchivedNotificationIds().has('n1')).toBe(true);

    const items = [
      { id: 'n1', title: 'A' },
      { id: 'n2', title: 'B' },
      { id: 'n3', title: 'C' },
    ];

    const inbox = filterArchivedNotifications(items, false);
    expect(inbox).toHaveLength(1);
    expect(inbox[0].id).toBe('n3');

    const archived = filterArchivedNotifications(items, true);
    expect(archived).toHaveLength(2);
  });
});
