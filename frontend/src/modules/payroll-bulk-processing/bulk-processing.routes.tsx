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

const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PayrollDashboardSkeleton />}>
    {children}
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
        element: <SuspenseLoader><PayrollUploadCenter /></SuspenseLoader>,
      },
      {
        path: 'preview/:uploadId',
        element: <SuspenseLoader><PayrollUploadPreview /></SuspenseLoader>,
      },
      {
        path: 'review/:uploadId/:rowId',
        element: <SuspenseLoader><PayrollMappingReview /></SuspenseLoader>,
      },
      {
        path: 'commitments',
        element: <SuspenseLoader><PayrollCommitmentCenter /></SuspenseLoader>,
      },
      {
        path: 'reconciliation',
        element: <SuspenseLoader><PayrollReconciliationDashboard /></SuspenseLoader>,
      },
      {
        path: 'treasury',
        element: <SuspenseLoader><TreasuryDashboard /></SuspenseLoader>,
      },
      {
        path: 'executive-intelligence',
        element: <SuspenseLoader><ExecutiveFinanceCommandCenter /></SuspenseLoader>,
      },
      {
        path: 'template-governance',
        element: <SuspenseLoader><PayslipTemplateGovernance /></SuspenseLoader>,
      },
    ],
  },
  {
    path: 'my-statements',
    element: <SuspenseLoader><EmployeePayslipsPage /></SuspenseLoader>,
  },
  {
    path: 'tax-declarations',
    element: <SuspenseLoader><InvestmentDeclarations /></SuspenseLoader>,
  },
  {
    path: 'payroll/payslip-governance',
    element: <SuspenseLoader><PayslipTemplateGovernance /></SuspenseLoader>,
  }
];


