import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { isTicketAssignmentsEnabled } from '@/config/features';

const MyQueuePage = lazy(() => import('./pages/MyQueuePage'));
const TeamQueuePage = lazy(() => import('./pages/TeamQueuePage'));
const AssignmentAnalyticsPage = lazy(() => import('./pages/AssignmentAnalyticsPage'));

const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="p-8"><DataTableSkeleton /></div>}>
    {children}
  </Suspense>
);

export const ticketAssignmentRoutes: RouteObject[] = isTicketAssignmentsEnabled
  ? [
      {
        path: 'my-queue',
        errorElement: <RouteErrorBoundary />,
        element: (
          <SuspenseLoader>
            <MyQueuePage />
          </SuspenseLoader>
        ),
      },
      {
        path: 'team-queue',
        errorElement: <RouteErrorBoundary />,
        element: (
          <SuspenseLoader>
            <TeamQueuePage />
          </SuspenseLoader>
        ),
      },
      {
        path: 'assignment-analytics',
        errorElement: <RouteErrorBoundary />,
        element: (
          <SuspenseLoader>
            <AssignmentAnalyticsPage />
          </SuspenseLoader>
        ),
      },
    ]
  : [];
