import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { PayrollDashboardSkeleton } from '@/components/payroll/PayrollSkeletons';

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
        element: withSuspense(PayrollUploadCenter),
      },
      {
        path: 'preview/:uploadId',
        element: withSuspense(PayrollUploadPreview),
      },
      {
        path: 'review/:uploadId/:rowId',
        element: withSuspense(PayrollMappingReview),
      },
      {
        path: 'commitments',
        element: withSuspense(PayrollCommitmentCenter),
      },
      {
        path: 'reconciliation',
        element: withSuspense(PayrollReconciliationDashboard),
      },
      {
        path: 'treasury',
        element: withSuspense(TreasuryDashboard),
      },
      {
        path: 'executive-intelligence',
        element: withSuspense(ExecutiveFinanceCommandCenter),
      },
      {
        path: 'template-governance',
        element: withSuspense(PayslipTemplateGovernance),
      },
    ],
  },
  {
    path: 'my-statements',
    element: withSuspense(EmployeePayslipsPage),
  },
  {
    path: 'tax-declarations',
    element: withSuspense(InvestmentDeclarations),
  },
  {
    path: 'payroll/payslip-governance',
    element: withSuspense(PayslipTemplateGovernance),
  }
];


