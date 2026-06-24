import { Navigate } from 'react-router-dom';
import { ROUTE_METADATA, type RouteMeta } from './route-metadata';
import { isFeatureFlagEnabled } from './features';
import { ROUTE_RBAC } from './route-rbac';
import { RouteGuard } from '@/components/routing/RouteGuard';
import type { Role } from '@/types';

export function resolveRouteMetadata(pathname: string): RouteMeta | undefined {
  if (ROUTE_METADATA[pathname]) {
    return ROUTE_METADATA[pathname];
  }

  const normalized = pathname.startsWith('/app') ? pathname : `/app${pathname}`;

  if (ROUTE_METADATA[normalized]) {
    return ROUTE_METADATA[normalized];
  }

  const entries = Object.entries(ROUTE_METADATA);
  for (const [pattern, meta] of entries) {
    if (!pattern.includes(':')) continue;
    const regex = new RegExp(
      `^${pattern.replace(/:[^/]+/g, '[^/]+')}$`
    );
    if (regex.test(pathname) || regex.test(normalized)) {
      return meta;
    }
  }

  return undefined;
}

export function getRouteRoles(path: string): Role[] {
  const meta = resolveRouteMetadata(path);
  return meta?.roles ?? [...ROUTE_RBAC.allAuthenticated];
}

export function getRouteFeatureFlag(path: string): string | null {
  return resolveRouteMetadata(path)?.featureFlag ?? null;
}

/** Wrap route element with RouteGuard + feature flag check from metadata SSOT. */
export function guardFromMetadata(routePath: string, element: React.ReactNode): React.ReactNode {
  const meta = resolveRouteMetadata(routePath);

  if (!meta) {
    if (import.meta.env.DEV) {
      console.warn(`[route-metadata] Missing metadata for ${routePath} — defaulting to allAuthenticated`);
    }
    return <RouteGuard allowedRoles={[...ROUTE_RBAC.allAuthenticated]}>{element}</RouteGuard>;
  }

  if (meta.public) {
    return element;
  }

  if (meta.featureFlag && !isFeatureFlagEnabled(meta.featureFlag)) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  return <RouteGuard allowedRoles={[...meta.roles]}>{element}</RouteGuard>;
}

export function validateRouteMetadataCoverage(routePaths: string[]): {
  covered: string[];
  missing: string[];
} {
  const covered: string[] = [];
  const missing: string[] = [];

  for (const path of routePaths) {
    const meta = resolveRouteMetadata(path);
    if (meta && (meta.public || meta.roles.length > 0)) {
      covered.push(path);
    } else {
      missing.push(path);
    }
  }

  return { covered, missing };
}
