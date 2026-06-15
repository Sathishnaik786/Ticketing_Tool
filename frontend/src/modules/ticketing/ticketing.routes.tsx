import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { isTicketingEnabled } from '@/config/features';

const TicketListPage = lazy(() => import('./pages/TicketListPage'));
const TicketCreatePage = lazy(() => import('./pages/TicketCreatePage'));
const TicketDetailPage = lazy(() => import('./pages/TicketDetailPage'));

const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="p-8"><DataTableSkeleton /></div>}>
    {children}
  </Suspense>
);

export const ticketingRoutes: RouteObject[] = isTicketingEnabled
  ? [
      {
        path: 'tickets',
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            index: true,
            element: (
              <SuspenseLoader>
                <TicketListPage />
              </SuspenseLoader>
            ),
          },
          {
            path: 'new',
            element: (
              <SuspenseLoader>
                <TicketCreatePage />
              </SuspenseLoader>
            ),
          },
          {
            path: ':ticketId',
            element: (
              <SuspenseLoader>
                <TicketDetailPage />
              </SuspenseLoader>
            ),
          },
        ],
      },
    ]
  : [];
