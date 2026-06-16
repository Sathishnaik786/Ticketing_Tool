import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { DataTableSkeleton } from '@/components/common/Skeletons';
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
        element: (
          <SuspenseLoader>
            <CommunicationsPage />
          </SuspenseLoader>
        ),
      },
      {
        path: 'activity-timeline',
        errorElement: <RouteErrorBoundary />,
        element: (
          <SuspenseLoader>
            <ActivityTimelinePage />
          </SuspenseLoader>
        ),
      },
      {
        path: 'communication-analytics',
        errorElement: <RouteErrorBoundary />,
        element: (
          <SuspenseLoader>
            <CommunicationAnalyticsPage />
          </SuspenseLoader>
        ),
      },
    ]
  : [];
