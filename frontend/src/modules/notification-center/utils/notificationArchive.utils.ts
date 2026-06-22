const ARCHIVE_KEY = 'ticketra_archived_notifications';

export function getArchivedNotificationIds(): Set<string> {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function archiveNotificationIds(ids: string[]): void {
  const current = getArchivedNotificationIds();
  ids.forEach((id) => current.add(id));
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify([...current]));
  } catch {
    // ignore
  }
}

export function unarchiveNotificationIds(ids: string[]): void {
  const current = getArchivedNotificationIds();
  ids.forEach((id) => current.delete(id));
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify([...current]));
  } catch {
    // ignore
  }
}

export function clearArchivedNotifications(): void {
  try {
    localStorage.removeItem(ARCHIVE_KEY);
  } catch {
    // ignore
  }
}

export function filterArchivedNotifications<T extends { id: string }>(
  notifications: T[],
  showArchived = false
): T[] {
  const archived = getArchivedNotificationIds();
  if (showArchived) {
    return notifications.filter((n) => archived.has(n.id));
  }
  return notifications.filter((n) => !archived.has(n.id));
}
