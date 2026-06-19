import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { guardFromMetadata } from '@/config/routeMetadata.utils';
import { isKnowledgeBaseEnabled } from '@/config/features';

const KnowledgeBasePage = lazy(() => import('./pages/KnowledgeBasePage'));
const KnowledgeArticlePage = lazy(() => import('./pages/KnowledgeArticlePage'));
const ArticleEditorPage = lazy(() => import('./pages/ArticleEditorPage'));
const KnowledgeAnalyticsPage = lazy(() => import('./pages/KnowledgeAnalyticsPage'));

const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="p-8"><DataTableSkeleton /></div>}>
    {children}
  </Suspense>
);

export const knowledgeManagementRoutes: RouteObject[] = isKnowledgeBaseEnabled
  ? [
      {
        path: 'knowledge-base',
        errorElement: <RouteErrorBoundary />,
        element: guardFromMetadata('/app/knowledge-base', (
          <SuspenseLoader><KnowledgeBasePage /></SuspenseLoader>
        )),
      },
      {
        path: 'articles/:id',
        errorElement: <RouteErrorBoundary />,
        element: guardFromMetadata('/app/articles/:id', (
          <SuspenseLoader><KnowledgeArticlePage /></SuspenseLoader>
        )),
      },
      {
        path: 'article-editor',
        errorElement: <RouteErrorBoundary />,
        element: guardFromMetadata('/app/article-editor', (
          <SuspenseLoader><ArticleEditorPage /></SuspenseLoader>
        )),
      },
      {
        path: 'kb-analytics',
        errorElement: <RouteErrorBoundary />,
        element: guardFromMetadata('/app/kb-analytics', (
          <SuspenseLoader><KnowledgeAnalyticsPage /></SuspenseLoader>
        )),
      },
    ]
  : [];
