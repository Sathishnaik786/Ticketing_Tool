const STORAGE_KEY = 'ticketra_search_history';
const MAX_RECENT = 8;

export interface SearchHistoryEntry {
  query: string;
  timestamp: string;
  href?: string;
}

export function getRecentSearches(): SearchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SearchHistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string, href?: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;

  const existing = getRecentSearches().filter(
    (entry) => entry.query.toLowerCase() !== trimmed.toLowerCase()
  );

  const updated: SearchHistoryEntry[] = [
    { query: trimmed, timestamp: new Date().toISOString(), href },
    ...existing,
  ].slice(0, MAX_RECENT);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage unavailable — silently ignore
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getSearchSuggestions(registryTitles: string[]): string[] {
  const common = [
    'my tickets',
    'create ticket',
    'my queue',
    'approvals',
    'notifications',
    'dashboard',
    'knowledge base',
  ];
  const merged = [...common, ...registryTitles.slice(0, 12)];
  const seen = new Set<string>();
  return merged.filter((s) => {
    const key = s.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
