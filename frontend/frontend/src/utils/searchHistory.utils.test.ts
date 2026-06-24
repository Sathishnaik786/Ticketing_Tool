import { describe, it, expect, beforeEach } from 'vitest';
import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  getSearchSuggestions,
} from './searchHistory.utils';

describe('searchHistory.utils', () => {
  beforeEach(() => {
    clearRecentSearches();
  });

  it('stores and retrieves recent searches', () => {
    addRecentSearch('my tickets', '/app/tickets?scope=mine');
    const recent = getRecentSearches();
    expect(recent).toHaveLength(1);
    expect(recent[0].query).toBe('my tickets');
    expect(recent[0].href).toBe('/app/tickets?scope=mine');
  });

  it('deduplicates recent searches', () => {
    addRecentSearch('tickets');
    addRecentSearch('tickets');
    expect(getRecentSearches()).toHaveLength(1);
  });

  it('returns search suggestions', () => {
    const suggestions = getSearchSuggestions(['Executive Dashboard', 'SLA Dashboard']);
    expect(suggestions).toContain('my tickets');
    expect(suggestions).toContain('Executive Dashboard');
  });
});
