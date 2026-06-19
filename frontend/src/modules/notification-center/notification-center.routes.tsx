import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { guardFromMetadata } from '@/config/routeMetadata.utils';
import { isNotificationCenterEnabled } from '@/config/features';

const NotificationCenterPage = lazy(() => import('./pages/NotificationCenterPage'));
const NotificationAnalyticsPage = lazy(() => import('./pages/NotificationAnalyticsPage'));

const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="p-8"><DataTableSkeleton /></div>}>
    {children}
  </Suspense>
);

export const notificationCenterRoutes: RouteObject[] = isNotificationCenterEnabled
  ? [
      { path: 'notifications', errorElement: <RouteErrorBoundary />, element: guardFromMetadata('/app/notifications', <SuspenseLoader><NotificationCenterPage /></SuspenseLoader>) },
      { path: 'notification-analytics', errorElement: <RouteErrorBoundary />, element: guardFromMetadata('/app/notification-analytics', <SuspenseLoader><NotificationAnalyticsPage /></SuspenseLoader>) },
    ]
  : [];
