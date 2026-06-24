import type { Role } from '@/types';
import { ROUTE_RBAC } from './route-rbac';

export interface RouteMeta {
  roles: Role[];
  featureFlag: string | null;
  /** Public routes skip RouteGuard (marketing, auth). */
  public?: boolean;
  /** Human-readable label for reports. */
  label?: string;
}

/**
 * Single source of truth for route-level RBAC and feature flags.
 * Keys are canonical paths under /app or public paths.
 */
export const ROUTE_METADATA: Record<string, RouteMeta> = {
  // ── Public / marketing ───────────────────────────────────────────────────
  '/': { roles: [], featureFlag: null, public: true, label: 'Landing' },
  '/login': { roles: [], featureFlag: null, public: true, label: 'Login' },
  '/forgot-password': { roles: [], featureFlag: null, public: true, label: 'Forgot Password' },
  '/reset-password': { roles: [], featureFlag: null, public: true, label: 'Reset Password' },
  '/workforce': { roles: [], featureFlag: null, public: true, label: 'Workforce' },
  '/payroll': { roles: [], featureFlag: null, public: true, label: 'Payroll Marketing' },
  '/intelligence': { roles: [], featureFlag: null, public: true, label: 'Intelligence' },
  '/governance': { roles: [], featureFlag: null, public: true, label: 'Governance' },
  '/operations': { roles: [], featureFlag: null, public: true, label: 'Operations' },
  '/about': { roles: [], featureFlag: null, public: true, label: 'About' },
  '/security-standards': { roles: [], featureFlag: null, public: true, label: 'Security Standards' },
  '/enterprise-sla': { roles: [], featureFlag: null, public: true, label: 'Enterprise SLA' },
  '/contact-sales': { roles: [], featureFlag: null, public: true, label: 'Contact Sales' },

  // ── App shell ────────────────────────────────────────────────────────────
  '/app/dashboard': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: null, label: 'Dashboard' },
  '/app/operator-dashboard': { roles: ROUTE_RBAC.operatorDashboard, featureFlag: 'VITE_ENABLE_ETMS_DASHBOARD', label: 'Operator Dashboard' },
  '/app/sla-dashboard': { roles: ROUTE_RBAC.slaDashboard, featureFlag: 'VITE_ENABLE_ETMS_DASHBOARD', label: 'SLA Dashboard' },
  '/app/profile': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: null, label: 'Profile' },
  '/app/unauthorized': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: null, label: 'Unauthorized' },

  // ── EMS / HCM ────────────────────────────────────────────────────────────
  '/app/employees': { roles: ['ADMIN', 'HR', 'MANAGER'], featureFlag: null, label: 'Employees' },
  '/app/departments': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: null, label: 'Departments' },
  '/app/attendance': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: null, label: 'Attendance' },
  '/app/leaves': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: null, label: 'Leaves' },
  '/app/calendar': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: null, label: 'Calendar' },
  '/app/meetups': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: null, label: 'Meetups' },
  '/app/documents': { roles: ['ADMIN', 'HR'], featureFlag: null, label: 'Documents' },
  '/app/reports': { roles: ['ADMIN', 'HR', 'MANAGER'], featureFlag: null, label: 'Reports' },
  '/app/projects': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: null, label: 'Projects' },
  '/app/my-projects': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: null, label: 'My Projects' },
  '/app/projects/:id': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: null, label: 'Project Detail' },

  // ── Admin ────────────────────────────────────────────────────────────────
  '/app/admin/users': { roles: ROUTE_RBAC.adminOnly, featureFlag: null, label: 'Admin Users' },

  // ── Payroll (EMS) ────────────────────────────────────────────────────────
  '/app/payroll/my-payslips': { roles: ROUTE_RBAC.payrollEmployee, featureFlag: null, label: 'My Payslips' },
  '/app/payroll': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Payroll Dashboard' },
  '/app/payroll/analytics': { roles: ROUTE_RBAC.executiveManager, featureFlag: null, label: 'Payroll Analytics' },
  '/app/payroll/variance': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Payroll Variance' },
  '/app/payroll/deductions': { roles: ROUTE_RBAC.payrollEmployee, featureFlag: null, label: 'Payroll Deductions' },
  '/app/payroll/components': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Salary Components' },
  '/app/payroll/structures': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Salary Structures' },
  '/app/payroll/assignments': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Salary Assignments' },
  '/app/payroll/settings': { roles: ROUTE_RBAC.adminOnly, featureFlag: null, label: 'Payroll Settings' },
  '/app/payroll/cycles': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Payroll Cycles' },
  '/app/payroll/cycles/:id': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Payroll Cycle Detail' },
  '/app/payroll/records/:id': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Payroll Record' },
  '/app/payroll/compliance': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Compliance Rules' },
  '/app/payroll/compliance/pf': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'PF Compliance' },
  '/app/payroll/tax-slabs': { roles: ROUTE_RBAC.adminOnly, featureFlag: null, label: 'Tax Slabs' },
  '/app/payroll/governance': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Governance Dashboard' },
  '/app/payroll/governance/approvals': { roles: ROUTE_RBAC.payrollGovernance, featureFlag: null, label: 'Payroll Approvals' },
  '/app/payroll/governance/variances': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Variance Dashboard' },
  '/app/payroll/finance/journals': { roles: ROUTE_RBAC.adminOnly, featureFlag: null, label: 'Journal Entries' },
  '/app/payroll/finance/disbursements': { roles: ROUTE_RBAC.adminOnly, featureFlag: null, label: 'Disbursements' },
  '/app/payroll/finance/erp-export': { roles: ROUTE_RBAC.adminOnly, featureFlag: null, label: 'ERP Export' },
  '/app/payroll/bulk': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Bulk Upload' },
  '/app/payroll/bulk/preview/:uploadId': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Bulk Preview' },
  '/app/payroll/bulk/review/:uploadId/:rowId': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Bulk Review' },
  '/app/payroll/bulk/commitments': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Bulk Commitments' },
  '/app/payroll/bulk/reconciliation': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Reconciliation' },
  '/app/payroll/bulk/treasury': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Treasury' },
  '/app/payroll/bulk/executive-intelligence': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Executive Finance' },
  '/app/payroll/bulk/template-governance': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Template Governance' },
  '/app/my-statements': { roles: ROUTE_RBAC.payrollEmployee, featureFlag: null, label: 'My Statements' },
  '/app/tax-declarations': { roles: ROUTE_RBAC.payrollEmployee, featureFlag: null, label: 'Tax Declarations' },
  '/app/payroll/payslip-governance': { roles: ROUTE_RBAC.payrollOps, featureFlag: null, label: 'Payslip Governance' },

  // ── Updates ──────────────────────────────────────────────────────────────
  '/app/updates/daily': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_DAILY_UPDATES', label: 'Daily Standup' },
  '/app/updates/weekly': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_WEEKLY_UPDATES', label: 'Weekly Update' },
  '/app/updates/monthly': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_MONTHLY_UPDATES', label: 'Monthly Update' },
  '/app/updates/analytics': { roles: ['ADMIN', 'HR', 'MANAGER'], featureFlag: 'VITE_ENABLE_UPDATE_ANALYTICS', label: 'Update Analytics' },
  '/app/updates/automation': { roles: ['ADMIN', 'HR'], featureFlag: null, label: 'Update Automation' },
  '/app/updates/employee/:employeeId': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: null, label: 'Employee Updates' },

  // ── ETMS Ticketing ───────────────────────────────────────────────────────
  '/app/tickets': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_TICKETING', label: 'Tickets' },
  '/app/tickets/new': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_TICKETING', label: 'Create Ticket' },
  '/app/tickets/:ticketId': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_TICKETING', label: 'Ticket Detail' },

  // ── Assignments ──────────────────────────────────────────────────────────
  '/app/my-queue': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_TICKET_ASSIGNMENTS', label: 'My Queue' },
  '/app/team-queue': { roles: ['ADMIN', 'HR', 'MANAGER'], featureFlag: 'VITE_ENABLE_TICKET_ASSIGNMENTS', label: 'Team Queue' },
  '/app/assignment-analytics': { roles: ['ADMIN', 'HR', 'MANAGER'], featureFlag: 'VITE_ENABLE_TICKET_ASSIGNMENTS', label: 'Assignment Analytics' },

  // ── Approvals ────────────────────────────────────────────────────────────
  '/app/approvals': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_APPROVAL_ENGINE', label: 'Approval Dashboard' },
  '/app/my-approvals': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_APPROVAL_ENGINE', label: 'My Approvals' },
  '/app/approval-analytics': { roles: ['ADMIN', 'HR', 'MANAGER'], featureFlag: 'VITE_ENABLE_APPROVAL_ENGINE', label: 'Approval Analytics' },

  // ── Knowledge ────────────────────────────────────────────────────────────
  '/app/knowledge-base': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_KNOWLEDGE_BASE', label: 'Knowledge Base' },
  '/app/knowledge-base/categories': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_KNOWLEDGE_BASE', label: 'KB Categories' },
  '/app/knowledge-base/search': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_KNOWLEDGE_BASE', label: 'KB Search' },
  '/app/articles/:id': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_KNOWLEDGE_BASE', label: 'Article' },
  '/app/article-editor': { roles: ROUTE_RBAC.kbEditor, featureFlag: 'VITE_ENABLE_KNOWLEDGE_BASE', label: 'Article Editor' },
  '/app/kb-analytics': { roles: ROUTE_RBAC.kbAnalytics, featureFlag: 'VITE_ENABLE_KNOWLEDGE_BASE', label: 'KB Analytics' },

  // ── Communications ───────────────────────────────────────────────────────
  '/app/communications': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_COMMUNICATION_TRACKING', label: 'Communications' },
  '/app/communications/announcements': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_COMMUNICATION_TRACKING', label: 'Announcements' },
  '/app/communications/discussions': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_COMMUNICATION_TRACKING', label: 'Discussions' },
  '/app/activity-timeline': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_COMMUNICATION_TRACKING', label: 'Activity Timeline' },
  '/app/activity-center': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_COMMUNICATION_TRACKING', label: 'Activity Center' },
  '/app/communication-analytics': { roles: ['ADMIN', 'HR', 'MANAGER'], featureFlag: 'VITE_ENABLE_COMMUNICATION_TRACKING', label: 'Communication Analytics' },

  // ── Executive Analytics ──────────────────────────────────────────────────
  '/app/executive-dashboard': { roles: ROUTE_RBAC.executive, featureFlag: 'VITE_ENABLE_EXECUTIVE_ANALYTICS', label: 'Executive Dashboard' },
  '/app/department-analytics': { roles: ROUTE_RBAC.executiveManager, featureFlag: 'VITE_ENABLE_EXECUTIVE_ANALYTICS', label: 'Department Analytics' },
  '/app/business-unit-analytics': { roles: ROUTE_RBAC.executive, featureFlag: 'VITE_ENABLE_EXECUTIVE_ANALYTICS', label: 'Business Unit Analytics' },
  '/app/analytics-reports': { roles: ROUTE_RBAC.executiveManager, featureFlag: 'VITE_ENABLE_EXECUTIVE_ANALYTICS', label: 'Analytics Reports' },

  // ── Notifications ──────────────────────────────────────────────────────
  '/app/notifications': { roles: ROUTE_RBAC.allAuthenticated, featureFlag: 'VITE_ENABLE_NOTIFICATION_CENTER', label: 'Notifications' },
  '/app/notification-analytics': { roles: ROUTE_RBAC.notificationAnalytics, featureFlag: 'VITE_ENABLE_NOTIFICATION_CENTER', label: 'Notification Analytics' },

  // ── Feedback ─────────────────────────────────────────────────────────────
  '/app/feedback-analytics': { roles: ['ADMIN', 'HR', 'MANAGER'], featureFlag: 'VITE_ENABLE_TICKET_FEEDBACK', label: 'Feedback Analytics' },
};

/** All protected app routes that must have metadata and RouteGuard. */
export const PROTECTED_APP_ROUTE_PATHS = Object.keys(ROUTE_METADATA).filter(
  (path) => path.startsWith('/app/') && !ROUTE_METADATA[path]?.public
);
