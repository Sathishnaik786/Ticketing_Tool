import type { Role } from '@/types';
import type { TicketFilters } from '../types/ticketing.types';

export type TicketListScope = 'mine' | 'team' | 'all';

export interface TicketScopeUser {
  id?: string;
  role?: Role | string;
  department_id?: string;
  departmentId?: string;
}

const PRIVILEGED_ROLES: Role[] = ['ADMIN', 'HR', 'MANAGER'];

export function canAccessTicketScope(scope: TicketListScope, role?: string): boolean {
  if (scope === 'mine') return true;
  if (!role) return false;
  return PRIVILEGED_ROLES.includes(role as Role);
}

/** Resolve URL scope to an effective scope (employees always get mine). */
export function resolveEffectiveTicketScope(
  rawScope: string | null,
  role?: string
): TicketListScope {
  if (rawScope === 'team' && canAccessTicketScope('team', role)) return 'team';
  if (rawScope === 'all' && canAccessTicketScope('all', role)) return 'all';
  return 'mine';
}

export function getTicketScopePageTitle(scope: TicketListScope): string {
  switch (scope) {
    case 'mine':
      return 'My Tickets';
    case 'team':
      return 'Team Tickets';
    case 'all':
      return 'All Tickets';
    default:
      return 'Tickets';
  }
}

export function buildTicketFiltersForScope(
  scope: TicketListScope,
  user: TicketScopeUser | null | undefined,
  base: Omit<TicketFilters, 'assignee_id' | 'requester_id' | 'department_id'>
): TicketFilters {
  const departmentId = user?.department_id ?? user?.departmentId;

  switch (scope) {
    case 'mine':
      if (user?.id) {
        return { ...base, assignee_id: user.id };
      }
      return base;
    case 'team':
      if (departmentId) {
        return { ...base, department_id: departmentId };
      }
      return base;
    case 'all':
    default:
      return base;
  }
}
