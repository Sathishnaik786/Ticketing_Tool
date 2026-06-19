import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/types';

interface RouteGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

/** Map legacy nav roles to application Role type. */
function normalizeRole(role?: string): Role | undefined {
  if (!role) return undefined;
  if (role === 'SUPER_ADMIN' || role === 'FINANCE') return 'ADMIN';
  if (role === 'ADMIN' || role === 'HR' || role === 'MANAGER' || role === 'EMPLOYEE') {
    return role;
  }
  return undefined;
}

/**
 * Page-level RBAC guard — supplements nav hiding and parent ProtectedRoute.
 * Never weakens access; only adds restrictions when allowedRoles is narrower.
 */
export function RouteGuard({ allowedRoles, children }: RouteGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(user.role);
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  return <>{children}</>;
}

export function withRouteGuard(allowedRoles: Role[], element: React.ReactNode) {
  return <RouteGuard allowedRoles={allowedRoles}>{element}</RouteGuard>;
}
