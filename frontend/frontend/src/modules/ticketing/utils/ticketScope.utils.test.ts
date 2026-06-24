import { describe, it, expect } from 'vitest';
import {
  resolveEffectiveTicketScope,
  buildTicketFiltersForScope,
  canAccessTicketScope,
} from './ticketScope.utils';

describe('ticketScope.utils', () => {
  it('allows mine for all roles', () => {
    expect(canAccessTicketScope('mine', 'EMPLOYEE')).toBe(true);
  });

  it('blocks team/all for employees', () => {
    expect(canAccessTicketScope('team', 'EMPLOYEE')).toBe(false);
    expect(canAccessTicketScope('all', 'EMPLOYEE')).toBe(false);
  });

  it('falls back employees to mine scope', () => {
    expect(resolveEffectiveTicketScope('team', 'EMPLOYEE')).toBe('mine');
    expect(resolveEffectiveTicketScope('all', 'EMPLOYEE')).toBe('mine');
  });

  it('allows managers team scope', () => {
    expect(resolveEffectiveTicketScope('team', 'MANAGER')).toBe('team');
  });

  it('builds mine filter with assignee_id', () => {
    const filters = buildTicketFiltersForScope('mine', { id: 'u1' }, { page: 1 });
    expect(filters.assignee_id).toBe('u1');
  });

  it('builds team filter with department_id', () => {
    const filters = buildTicketFiltersForScope(
      'team',
      { id: 'u1', department_id: 'dept-1' },
      { page: 1 }
    );
    expect(filters.department_id).toBe('dept-1');
  });

  it('builds all filter without restrictions', () => {
    const filters = buildTicketFiltersForScope('all', { id: 'u1', role: 'ADMIN' }, { page: 1 });
    expect(filters.assignee_id).toBeUndefined();
    expect(filters.department_id).toBeUndefined();
  });
});
