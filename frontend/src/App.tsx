import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { OnlineStatusProvider } from '@/contexts/OnlineStatusContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AppBootstrap } from '@/components/common/AppBootstrap';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { CommandProvider } from '@/contexts/CommandContext';
import { ThemeProvider } from "next-themes";
import { guardFromMetadata } from '@/config/routeMetadata.utils';
import { lazyPage, withPageSuspense } from '@/components/routing/LazyPage';
import { observability } from '@/services/observability';
import {
  isEtmsDashboardEnabled,
  isExecutiveAnalyticsEnabled,
  isTicketingEnabled,
} from '@/config/features';
import { updatesRoutes } from './modules/updates/updates.routes';
import { payrollRoutes } from './modules/payroll/payroll.routes';
import { bulkProcessingRoutes } from './modules/payroll-bulk-processing/bulk-processing.routes';
import { ticketingRoutes } from './modules/ticketing/ticketing.routes';
import { ticketFeedbackRoutes } from './modules/ticket-feedback/ticket-feedback.routes';
import { ticketAssignmentRoutes } from './modules/ticket-assignment/ticket-assignment.routes';
import { communicationTrackingRoutes } from './modules/communication-tracking/communication-tracking.routes';
import { approvalManagementRoutes } from './modules/approval-management/approval-management.routes';
import { knowledgeManagementRoutes } from './modules/knowledge-management/knowledge-management.routes';
import { executiveAnalyticsRoutes } from './modules/executive-analytics/executive-analytics.routes';
import { notificationCenterRoutes } from './modules/notification-center/notification-center.routes';

const Login = lazyPage(() => import("./pages/Login"));
const ForgotPassword = lazyPage(() => import("./pages/ForgotPassword"));
const ResetPassword = lazyPage(() => import("./pages/ResetPassword"));
const Dashboard = lazyPage(() => import("./pages/Dashboard"));
const Employees = lazyPage(() => import("./pages/Employees"));
const Departments = lazyPage(() => import("./pages/Departments"));
const AttendancePage = lazyPage(() => import("./pages/Attendance"));
const Leaves = lazyPage(() => import("./pages/Leaves"));
const Documents = lazyPage(() => import("./pages/Documents"));
const Reports = lazyPage(() => import("./pages/Reports"));
const Profile = lazyPage(() => import("./pages/Profile"));
const CalendarPage = lazyPage(() => import("./pages/Calendar"));
const MeetupsPage = lazyPage(() => import("./pages/Meetups"));
const NotFound = lazyPage(() => import("./pages/NotFound"));
const Unauthorized = lazyPage(() => import("./pages/Unauthorized"));
const Landing = lazyPage(() => import("./pages/Landing"));
const WorkforcePage = lazyPage(() => import("./pages/Workforce"));
const PayrollPage = lazyPage(() => import("./pages/Payroll"));
const IntelligencePage = lazyPage(() => import("./pages/Intelligence"));
const GovernancePage = lazyPage(() => import("./pages/Governance"));
const OperationsPage = lazyPage(() => import("./pages/Operations"));
const AboutPage = lazyPage(() => import("./pages/About"));
const SecurityStandardsPage = lazyPage(() => import("./pages/SecurityStandards"));
const EnterpriseSLAPage = lazyPage(() => import("./pages/EnterpriseSLA"));
const ContactSalesPage = lazyPage(() => import("./pages/ContactSales"));
const MyPayslips = lazyPage(() => import("./pages/MyPayslips"));
const AdminUsers = lazyPage(() => import('./pages/AdminUsers'));
const Projects = lazyPage(() => import('./pages/Projects'));
const MyProjects = lazyPage(() => import('./pages/MyProjects'));
const ProjectDetail = lazyPage(() => import('./pages/ProjectDetail'));
const OperatorDashboardPage = lazyPage(() => import('./modules/dashboard/pages/OperatorDashboardPage'));
const SlaDashboardPage = lazyPage(() => import('./modules/dashboard/pages/SlaDashboardPage'));

function L({ Page }: { Page: React.LazyExoticComponent<React.ComponentType<object>> }) {
  return withPageSuspense(<Page />);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
      onError: (error) => {
        observability.captureException(error, { tags: { source: 'react-query-mutation' } });
      },
    },
  },
});

const router = createBrowserRouter([
  { path: "/", element: guardFromMetadata('/', <L Page={Landing} />) },
  { path: "/workforce", element: guardFromMetadata('/workforce', <L Page={WorkforcePage} />) },
  { path: "/payroll", element: guardFromMetadata('/payroll', <L Page={PayrollPage} />) },
  { path: "/intelligence", element: guardFromMetadata('/intelligence', <L Page={IntelligencePage} />) },
  { path: "/governance", element: guardFromMetadata('/governance', <L Page={GovernancePage} />) },
  { path: "/operations", element: guardFromMetadata('/operations', <L Page={OperationsPage} />) },
  { path: "/about", element: guardFromMetadata('/about', <L Page={AboutPage} />) },
  { path: "/security-standards", element: guardFromMetadata('/security-standards', <L Page={SecurityStandardsPage} />) },
  { path: "/enterprise-sla", element: guardFromMetadata('/enterprise-sla', <L Page={EnterpriseSLAPage} />) },
  { path: "/contact-sales", element: guardFromMetadata('/contact-sales', <L Page={ContactSalesPage} />) },
  { path: "/login", element: guardFromMetadata('/login', <L Page={Login} />) },
  { path: "/forgot-password", element: guardFromMetadata('/forgot-password', <L Page={ForgotPassword} />) },
  { path: "/reset-password", element: guardFromMetadata('/reset-password', <L Page={ResetPassword} />) },
  {
    path: "/app",
    element: <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']}>/* AppLayout */</ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: "dashboard", element: guardFromMetadata('/app/dashboard', <L Page={Dashboard} />) },
      ...(isEtmsDashboardEnabled
        ? [{ path: 'operator-dashboard', element: guardFromMetadata('/app/operator-dashboard', <L Page={OperatorDashboardPage} />) }]
        : []),
      ...(isExecutiveAnalyticsEnabled || isEtmsDashboardEnabled
        ? [{ path: 'sla-dashboard', element: guardFromMetadata('/app/sla-dashboard', <L Page={SlaDashboardPage} />) }]
        : []),
      { path: "employees", element: guardFromMetadata('/app/employees', <L Page={Employees} />) },
      { path: "departments", element: guardFromMetadata('/app/departments', <L Page={Departments} />) },
      { path: "attendance", element: guardFromMetadata('/app/attendance', <L Page={AttendancePage} />) },
      { path: "leaves", element: guardFromMetadata('/app/leaves', <L Page={Leaves} />) },
      { path: "calendar", element: guardFromMetadata('/app/calendar', <L Page={CalendarPage} />) },
      { path: "meetups", element: guardFromMetadata('/app/meetups', <L Page={MeetupsPage} />) },
      { path: "documents", element: guardFromMetadata('/app/documents', <L Page={Documents} />) },
      { path: "payroll/my-payslips", element: guardFromMetadata('/app/payroll/my-payslips', <L Page={MyPayslips} />) },
      { path: "reports", element: guardFromMetadata('/app/reports', <L Page={Reports} />) },
      { path: "admin/users", element: guardFromMetadata('/app/admin/users', <L Page={AdminUsers} />) },
      { path: "projects", element: guardFromMetadata('/app/projects', <L Page={Projects} />) },
      { path: "my-projects", element: guardFromMetadata('/app/my-projects', <L Page={MyProjects} />) },
      { path: "projects/:id", element: guardFromMetadata('/app/projects/:id', <L Page={ProjectDetail} />) },
      { path: "profile", element: guardFromMetadata('/app/profile', <L Page={Profile} />) },
      { path: "unauthorized", element: guardFromMetadata('/app/unauthorized', <L Page={Unauthorized} />) },
      ...updatesRoutes,
      ...payrollRoutes,
      ...bulkProcessingRoutes,
      ...(isTicketingEnabled ? ticketingRoutes : []),
      ...ticketFeedbackRoutes,
      ...ticketAssignmentRoutes,
      ...communicationTrackingRoutes,
      ...approvalManagementRoutes,
      ...knowledgeManagementRoutes,
      ...executiveAnalyticsRoutes,
      ...notificationCenterRoutes,
      { path: "*", element: <L Page={NotFound} /> },
    ],
  },
  { path: "*", element: <L Page={NotFound} /> },
], {
  future: { v7_relativeSplatPath: true },
});

const AppContent = () => (
  <AppBootstrap>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </AppBootstrap>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SidebarProvider>
        <OnlineStatusProvider>
          <CommandProvider>
            <ThemeProvider defaultTheme="light" attribute="class">
              <AppContent />
            </ThemeProvider>
          </CommandProvider>
        </OnlineStatusProvider>
      </SidebarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
