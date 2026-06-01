import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { OnlineStatusProvider } from '@/contexts/OnlineStatusContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AppLayout } from "@/components/layout/AppLayout";
import { AppLoader } from '@/components/common/AppLoader';
import { AppBootstrap } from '@/components/common/AppBootstrap';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { CommandProvider } from '@/contexts/CommandContext';
import { CommandPalette } from '@/components/common/CommandPalette';
import { QuickActionLauncher } from '@/components/common/QuickActionLauncher';
import { ThemeProvider } from "next-themes";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import AttendancePage from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Documents from "./pages/Documents";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import CalendarPage from "./pages/Calendar";
import MeetupsPage from "./pages/Meetups";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Landing from "./pages/Landing";
import WorkforcePage from "./pages/Workforce";
import PayrollPage from "./pages/Payroll";
import IntelligencePage from "./pages/Intelligence";
import GovernancePage from "./pages/Governance";
import OperationsPage from "./pages/Operations";
import AboutPage from "./pages/About";
import SecurityStandardsPage from "./pages/SecurityStandards";
import EnterpriseSLAPage from "./pages/EnterpriseSLA";
import ContactSalesPage from "./pages/ContactSales";
import MyPayslips from "./pages/MyPayslips";
import { updatesRoutes } from './modules/updates/updates.routes';
import { payrollRoutes } from './modules/payroll/payroll.routes';
import { bulkProcessingRoutes } from './modules/payroll-bulk-processing/bulk-processing.routes';


import AdminUsers from './pages/AdminUsers';
import Projects from './pages/Projects';
import MyProjects from './pages/MyProjects';
import ProjectDetail from './pages/ProjectDetail';

// Optimized QueryClient configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (replaces cacheTime in v5)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Don't refetch on mount if data exists
      refetchOnReconnect: true, // Refetch on reconnect
      retry: 1, // Retry failed requests once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: false, // Don't retry mutations
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

const router = createBrowserRouter([
  { path: "/", element: <Landing /> }, // New Enterprise Landing Page
  { path: "/workforce", element: <WorkforcePage /> },
  { path: "/payroll", element: <PayrollPage /> },
  { path: "/intelligence", element: <IntelligencePage /> },
  { path: "/governance", element: <GovernancePage /> },
  { path: "/operations", element: <OperationsPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/security-standards", element: <SecurityStandardsPage /> },
  { path: "/enterprise-sla", element: <EnterpriseSLAPage /> },
  { path: "/contact-sales", element: <ContactSalesPage /> },
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  {
    path: "/app", // Protected routes under /app path
    element: <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']}>/* AppLayout is handled by ProtectedRoute */</ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "employees", element: <Employees /> },
      { path: "departments", element: <Departments /> },
      { path: "attendance", element: <AttendancePage /> },
      { path: "leaves", element: <Leaves /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "meetups", element: <MeetupsPage /> },
      { path: "documents", element: <Documents /> },
      { path: "payroll/my-payslips", element: <MyPayslips /> },
      { path: "reports", element: <Reports /> },

      { path: "admin/users", element: <AdminUsers /> },
      { path: "projects", element: <Projects /> },
      { path: "my-projects", element: <MyProjects /> },
      { path: "projects/:id", element: <ProjectDetail /> },


      { path: "profile", element: <Profile /> },
      { path: "unauthorized", element: <Unauthorized /> },

      // Phase-1: Employee Updates
      ...updatesRoutes,

      // Phase-1: Payroll Module
      ...payrollRoutes,

      // Phase-1: Payroll Bulk Processing
      ...bulkProcessingRoutes,

      { path: "*", element: <NotFound /> },

    ],
  },
  { path: "*", element: <NotFound /> }
], {
  future: {
    v7_relativeSplatPath: true,
  },
});

const AppContent = () => {
  return (
    <AppBootstrap>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </AppBootstrap>
  );
};

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
