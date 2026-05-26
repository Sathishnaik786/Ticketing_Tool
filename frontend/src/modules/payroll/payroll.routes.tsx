import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { PayrollDashboardSkeleton } from '@/components/payroll/PayrollSkeletons';

// Core Pages
const PayrollDashboard = lazy(() => import('./pages/PayrollDashboard'));
const SalaryComponents = lazy(() => import('./pages/SalaryComponents'));
const SalaryStructures = lazy(() => import('./pages/SalaryStructures'));
const SalaryAssignments = lazy(() => import('./pages/SalaryAssignments'));
const PayrollSettings = lazy(() => import('./pages/PayrollSettings'));
const PayrollCycles = lazy(() => import('./pages/PayrollCycles'));
const PayrollCycleDetail = lazy(() => import('./pages/PayrollCycleDetail'));
const PayrollRecordDetail = lazy(() => import('./pages/PayrollRecordDetail'));
const ComplianceRules = lazy(() => import('./pages/ComplianceRules'));
const TaxSlabs = lazy(() => import('./pages/TaxSlabs'));
const EmployeePayslips = lazy(() => import('./pages/EmployeePayslips'));

// Governance & Intelligence
const GovernanceDashboard = lazy(() => import('./pages/GovernanceDashboard'));
const ApprovalQueue = lazy(() => import('./pages/ApprovalQueue'));
const VarianceDashboard = lazy(() => import('./pages/VarianceDashboard'));
const PayrollAnalytics = lazy(() => import('./pages/PayrollAnalytics'));
const PayrollVariance = lazy(() => import('./pages/PayrollVariance'));
const PayrollDeductions = lazy(() => import('./pages/PayrollDeductions'));
const PFCompliance = lazy(() => import('./pages/PFCompliance'));

// Finance & Ops
const JournalEntries = lazy(() => import('./pages/JournalEntries'));
const DisbursementDashboard = lazy(() => import('./pages/DisbursementDashboard'));
const ErpExportCenter = lazy(() => import('./pages/ErpExportCenter'));

const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PayrollDashboardSkeleton />}>
    {children}
  </Suspense>
);

export const payrollRoutes: RouteObject[] = [
  {
    path: 'payroll',
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <SuspenseLoader><PayrollDashboard /></SuspenseLoader>,
      },
      {
        path: 'analytics',
        element: <SuspenseLoader><PayrollAnalytics /></SuspenseLoader>,
      },
      {
        path: 'variance',
        element: <SuspenseLoader><PayrollVariance /></SuspenseLoader>,
      },
      {
        path: 'deductions',
        element: <SuspenseLoader><PayrollDeductions /></SuspenseLoader>,
      },
      {
        path: 'components',
        element: <SuspenseLoader><SalaryComponents /></SuspenseLoader>,
      },
      {
        path: 'structures',
        element: <SuspenseLoader><SalaryStructures /></SuspenseLoader>,
      },
      {
        path: 'assignments',
        element: <SuspenseLoader><SalaryAssignments /></SuspenseLoader>,
      },
      {
        path: 'settings',
        element: <SuspenseLoader><PayrollSettings /></SuspenseLoader>,
      },
      {
        path: 'cycles',
        element: <SuspenseLoader><PayrollCycles /></SuspenseLoader>,
      },
      {
        path: 'cycles/:id',
        element: <SuspenseLoader><PayrollCycleDetail /></SuspenseLoader>,
      },
      {
        path: 'records/:id',
        element: <SuspenseLoader><PayrollRecordDetail /></SuspenseLoader>,
      },
      {
        path: 'compliance',
        children: [
          {
            index: true,
            element: <SuspenseLoader><ComplianceRules /></SuspenseLoader>,
          },
          {
            path: 'pf',
            element: <SuspenseLoader><PFCompliance /></SuspenseLoader>,
          },
        ],
      },
      {
        path: 'tax-slabs',
        element: <SuspenseLoader><TaxSlabs /></SuspenseLoader>,
      },
      {
        path: 'my-payslips',
        element: <SuspenseLoader><EmployeePayslips /></SuspenseLoader>,
      },
      {
        path: 'governance',
        children: [
          {
            index: true,
            element: <SuspenseLoader><GovernanceDashboard /></SuspenseLoader>,
          },
          {
            path: 'approvals',
            element: <SuspenseLoader><ApprovalQueue /></SuspenseLoader>,
          },
          {
            path: 'variances',
            element: <SuspenseLoader><VarianceDashboard /></SuspenseLoader>,
          },
        ],
      },
      {
        path: 'finance',
        children: [
          {
            path: 'journals',
            element: <SuspenseLoader><JournalEntries /></SuspenseLoader>,
          },
          {
            path: 'disbursements',
            element: <SuspenseLoader><DisbursementDashboard /></SuspenseLoader>,
          },
          {
            path: 'erp-export',
            element: <SuspenseLoader><ErpExportCenter /></SuspenseLoader>,
          },
        ],
      },
    ],
  },
];

