import React from 'react';
import { RouteObject } from 'react-router-dom';
import { guardFromMetadata } from '@/config/routeMetadata.utils';

// Lazy load pages for performance
const CatalogPage = React.lazy(() => import('./pages/CatalogPage'));
const CatalogDetailPage = React.lazy(() => import('./pages/CatalogDetailPage'));
const WorkflowBuilderPage = React.lazy(() => import('./pages/WorkflowBuilderPage'));
const ApprovalsDashboardPage = React.lazy(() => import('./pages/ApprovalsDashboardPage'));
const SlaSettingsPage = React.lazy(() => import('./pages/SlaSettingsPage'));
const SystemSettingsPage = React.lazy(() => import('./pages/SystemSettingsPage'));

const routes: RouteObject[] = [
  {
    path: 'esm/catalog',
    element: guardFromMetadata('/app/esm/catalog', <CatalogPage />),
  },
  {
    path: 'esm/catalog/:id',
    element: guardFromMetadata('/app/esm/catalog/:id', <CatalogDetailPage />),
  },
  {
    path: 'esm/workflows',
    element: guardFromMetadata('/app/esm/workflows', <WorkflowBuilderPage />),
  },
  {
    path: 'esm/approvals',
    element: guardFromMetadata('/app/esm/approvals', <ApprovalsDashboardPage />),
  },
  {
    path: 'esm/sla',
    element: guardFromMetadata('/app/esm/sla', <SlaSettingsPage />),
  },
  {
    path: 'esm/settings',
    element: guardFromMetadata('/app/esm/settings', <SystemSettingsPage />),
  }
];

export const esmRoutes: RouteObject[] = routes;
export default esmRoutes;
