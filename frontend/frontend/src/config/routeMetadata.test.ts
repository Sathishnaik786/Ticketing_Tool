import { describe, it, expect } from 'vitest';
import { PROTECTED_APP_ROUTE_PATHS, ROUTE_METADATA } from './route-metadata';
import {
  getRouteRoles,
  resolveRouteMetadata,
  validateRouteMetadataCoverage,
} from './routeMetadata.utils';

describe('route metadata registry', () => {
  it('every protected app route has metadata with roles', () => {
    const { missing } = validateRouteMetadataCoverage(PROTECTED_APP_ROUTE_PATHS);
    expect(missing).toEqual([]);
  });

  it('admin users route restricts to ADMIN', () => {
    expect(getRouteRoles('/app/admin/users')).toEqual(['ADMIN']);
  });

  it('executive dashboard requires HR or ADMIN', () => {
    const roles = getRouteRoles('/app/executive-dashboard');
    expect(roles).toContain('HR');
    expect(roles).toContain('ADMIN');
  });

  it('resolves parameterized project route', () => {
    const meta = resolveRouteMetadata('/app/projects/abc-123');
    expect(meta?.label).toBe('Project Detail');
  });

  it('resolves parameterized ticket route', () => {
    const meta = resolveRouteMetadata('/app/tickets/ticket-uuid');
    expect(meta?.featureFlag).toBe('VITE_ENABLE_TICKETING');
  });

  it('public routes are marked public', () => {
    expect(ROUTE_METADATA['/login'].public).toBe(true);
    expect(ROUTE_METADATA['/app/dashboard'].public).toBeUndefined();
  });

  it('feature-flagged ETMS routes declare flags', () => {
    expect(ROUTE_METADATA['/app/operator-dashboard'].featureFlag).toBe('VITE_ENABLE_ETMS_DASHBOARD');
    expect(ROUTE_METADATA['/app/knowledge-base'].featureFlag).toBe('VITE_ENABLE_KNOWLEDGE_BASE');
  });

  it('payroll governance approvals path matches nav', () => {
    expect(ROUTE_METADATA['/app/payroll/governance/approvals'].roles).toContain('MANAGER');
  });
});
