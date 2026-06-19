import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { guardFromMetadata } from '@/config/routeMetadata.utils';
import { isCommunicationTrackingEnabled } from '@/config/features';

const CommunicationsPage = lazy(() => import('./pages/CommunicationsPage'));
const ActivityTimelinePage = lazy(() => import('./pages/ActivityTimelinePage'));
const CommunicationAnalyticsPage = lazy(() => import('./pages/CommunicationAnalyticsPage'));

const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="p-8"><DataTableSkeleton /></div>}>
    {children}
  </Suspense>
);

export const communicationTrackingRoutes: RouteObject[] = isCommunicationTrackingEnabled
  ? [
      {
        path: 'communications',
        errorElement: <RouteErrorBoundary />,
        element: guardFromMetadata('/app/communications', (
          <SuspenseLoader><CommunicationsPage /></SuspenseLoader>
        )),
      },
      {
        path: 'activity-timeline',
        errorElement: <RouteErrorBoundary />,
        element: guardFromMetadata('/app/activity-timeline', (
          <SuspenseLoader><ActivityTimelinePage /></SuspenseLoader>
        )),
      },
      {
        path: 'communication-analytics',
        errorElement: <RouteErrorBoundary />,
        element: guardFromMetadata('/app/communication-analytics', (
          <SuspenseLoader><CommunicationAnalyticsPage /></SuspenseLoader>
        )),
      },
    ]
  : [];
