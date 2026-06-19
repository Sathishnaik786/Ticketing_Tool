import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { guardFromMetadata } from '@/config/routeMetadata.utils';
import { isApprovalEngineEnabled } from '@/config/features';

const ApprovalDashboardPage = lazy(() => import('./pages/ApprovalDashboardPage'));
const MyApprovalsPage = lazy(() => import('./pages/MyApprovalsPage'));
const ApprovalAnalyticsPage = lazy(() => import('./pages/ApprovalAnalyticsPage'));

const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="p-8"><DataTableSkeleton /></div>}>
    {children}
  </Suspense>
);

export const approvalManagementRoutes: RouteObject[] = isApprovalEngineEnabled
  ? [
      {
        path: 'approvals',
        errorElement: <RouteErrorBoundary />,
        element: guardFromMetadata('/app/approvals', (
          <SuspenseLoader><ApprovalDashboardPage /></SuspenseLoader>
        )),
      },
      {
        path: 'my-approvals',
        errorElement: <RouteErrorBoundary />,
        element: guardFromMetadata('/app/my-approvals', (
          <SuspenseLoader><MyApprovalsPage /></SuspenseLoader>
        )),
      },
      {
        path: 'approval-analytics',
        errorElement: <RouteErrorBoundary />,
        element: guardFromMetadata('/app/approval-analytics', (
          <SuspenseLoader><ApprovalAnalyticsPage /></SuspenseLoader>
        )),
      },
    ]
  : [];
