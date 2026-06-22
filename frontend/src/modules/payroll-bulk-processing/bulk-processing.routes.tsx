import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { PayrollDashboardSkeleton } from '@/components/payroll/PayrollSkeletons';
import { guardFromMetadata } from '@/config/routeMetadata.utils';

const PayrollUploadCenter = lazy(() => import('./pages/PayrollUploadCenter'));
const PayrollUploadPreview = lazy(() => import('./pages/PayrollUploadPreview'));
const PayrollMappingReview = lazy(() => import('./pages/PayrollMappingReview'));
const PayrollCommitmentCenter = lazy(() => import('./pages/PayrollCommitmentCenter'));
const EmployeePayslipsPage = lazy(() => import('./pages/EmployeePayslipsPage'));
const PayslipTemplateGovernance = lazy(() => import('./pages/PayslipTemplateGovernance'));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PayrollDashboardSkeleton />}>
    <Component />
  </Suspense>
);

const PayrollReconciliationDashboard = lazy(() => import('../payroll-finance/pages/PayrollReconciliationDashboard'));

const ExecutiveFinanceCommandCenter = lazy(() => import('../payroll-analytics/pages/ExecutiveFinanceCommandCenter'));
const TreasuryDashboard = lazy(() => import('../payroll-treasury/pages/TreasuryDashboard'));
const InvestmentDeclarations = lazy(() => import('../payroll-compliance/pages/InvestmentDeclarations'));

export const bulkProcessingRoutes: RouteObject[] = [
  {
    path: 'payroll/bulk',
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: guardFromMetadata('/app/payroll/bulk', withSuspense(PayrollUploadCenter)),
      },
      {
        path: 'preview/:uploadId',
        element: guardFromMetadata('/app/payroll/bulk/preview/:uploadId', withSuspense(PayrollUploadPreview)),
      },
      {
        path: 'review/:uploadId/:rowId',
        element: guardFromMetadata('/app/payroll/bulk/review/:uploadId/:rowId', withSuspense(PayrollMappingReview)),
      },
      {
        path: 'commitments',
        element: guardFromMetadata('/app/payroll/bulk/commitments', withSuspense(PayrollCommitmentCenter)),
      },
      {
        path: 'reconciliation',
        element: guardFromMetadata('/app/payroll/bulk/reconciliation', withSuspense(PayrollReconciliationDashboard)),
      },
      {
        path: 'treasury',
        element: guardFromMetadata('/app/payroll/bulk/treasury', withSuspense(TreasuryDashboard)),
      },
      {
        path: 'executive-intelligence',
        element: guardFromMetadata('/app/payroll/bulk/executive-intelligence', withSuspense(ExecutiveFinanceCommandCenter)),
      },
      {
        path: 'template-governance',
        element: guardFromMetadata('/app/payroll/bulk/template-governance', withSuspense(PayslipTemplateGovernance)),
      },
    ],
  },
  {
    path: 'my-statements',
    element: guardFromMetadata('/app/my-statements', withSuspense(EmployeePayslipsPage)),
  },
  {
    path: 'tax-declarations',
    element: guardFromMetadata('/app/tax-declarations', withSuspense(InvestmentDeclarations)),
  },
  {
    path: 'payroll/payslip-governance',
    element: guardFromMetadata('/app/payroll/payslip-governance', withSuspense(PayslipTemplateGovernance)),
  }
];


