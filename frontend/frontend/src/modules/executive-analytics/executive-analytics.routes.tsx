import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { guardFromMetadata } from '@/config/routeMetadata.utils';
import { isExecutiveAnalyticsEnabled } from '@/config/features';

const ExecutiveDashboardPage = lazy(() => import('./pages/ExecutiveDashboardPage'));
const DepartmentAnalyticsPage = lazy(() => import('./pages/DepartmentAnalyticsPage'));
const BusinessUnitAnalyticsPage = lazy(() => import('./pages/BusinessUnitAnalyticsPage'));
const AnalyticsReportsPage = lazy(() => import('./pages/AnalyticsReportsPage'));

const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="p-8"><DataTableSkeleton /></div>}>
    {children}
  </Suspense>
);

export const executiveAnalyticsRoutes: RouteObject[] = isExecutiveAnalyticsEnabled
  ? [
      { path: 'executive-dashboard', errorElement: <RouteErrorBoundary />, element: guardFromMetadata('/app/executive-dashboard', <SuspenseLoader><ExecutiveDashboardPage /></SuspenseLoader>) },
      { path: 'department-analytics', errorElement: <RouteErrorBoundary />, element: guardFromMetadata('/app/department-analytics', <SuspenseLoader><DepartmentAnalyticsPage /></SuspenseLoader>) },
      { path: 'business-unit-analytics', errorElement: <RouteErrorBoundary />, element: guardFromMetadata('/app/business-unit-analytics', <SuspenseLoader><BusinessUnitAnalyticsPage /></SuspenseLoader>) },
      { path: 'analytics-reports', errorElement: <RouteErrorBoundary />, element: guardFromMetadata('/app/analytics-reports', <SuspenseLoader><AnalyticsReportsPage /></SuspenseLoader>) },
    ]
  : [];
