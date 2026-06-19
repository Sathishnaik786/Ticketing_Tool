import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { guardFromMetadata } from '@/config/routeMetadata.utils';
import { isTicketFeedbackEnabled } from '@/config/features';

const FeedbackAnalyticsPage = lazy(() => import('./pages/FeedbackAnalyticsPage'));

const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="p-8"><DataTableSkeleton /></div>}>
    {children}
  </Suspense>
);

export const ticketFeedbackRoutes: RouteObject[] = isTicketFeedbackEnabled
  ? [
      {
        path: 'feedback-analytics',
        errorElement: <RouteErrorBoundary />,
        element: guardFromMetadata('/app/feedback-analytics', (
          <SuspenseLoader><FeedbackAnalyticsPage /></SuspenseLoader>
        )),
      },
    ]
  : [];
