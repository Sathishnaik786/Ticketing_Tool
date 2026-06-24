import type { Role } from '@/types';

/** Route-level RBAC aligned with navigation registry roles (SUPER_ADMIN/FINANCE excluded). */
export const ROUTE_RBAC = {
  allAuthenticated: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] as Role[],
  adminOnly: ['ADMIN'] as Role[],
  payrollOps: ['ADMIN', 'HR'] as Role[],
  payrollGovernance: ['ADMIN', 'HR', 'MANAGER'] as Role[],
  payrollEmployee: ['ADMIN', 'HR', 'EMPLOYEE'] as Role[],
  executive: ['HR', 'ADMIN'] as Role[],
  executiveManager: ['MANAGER', 'HR', 'ADMIN'] as Role[],
  kbEditor: ['MANAGER', 'ADMIN', 'EMPLOYEE'] as Role[],
  kbAnalytics: ['MANAGER', 'HR', 'ADMIN'] as Role[],
  notificationAnalytics: ['MANAGER', 'HR', 'ADMIN'] as Role[],
  operatorDashboard: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] as Role[],
  slaDashboard: ['HR', 'ADMIN', 'MANAGER'] as Role[],
} as const;
