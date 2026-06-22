import type { ElementType } from 'react';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Inbox,
  Users,
  BarChart3,
  CheckSquare,
  ClipboardCheck,
  BookOpen,
  FileEdit,
  MessageSquare,
  Activity,
  Bell,
  Settings,
  Building2,
  ShieldCheck,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  FolderKanban,
  Users2,
  Sparkles,
  Archive,
  User,
  LayoutTemplate,
  ClipboardList,
  Calculator,
  Database,
  FileUp,
  Layers,
  FileSpreadsheet,
  Star,
} from 'lucide-react';
import type { NavItem, NavGroup } from './types';
import { etmsNavItems } from './etms.navigation';
import { analyticsNavItems } from './analytics.navigation';
import { adminNavItems } from './admin.navigation';
import { legacyNavItems } from './legacy.navigation';
import { payrollNavItems } from './payroll.navigation';

export type { NavItem, NavGroup } from './types';

export const NAV_ITEMS: NavItem[] = [
  ...etmsNavItems,
  ...analyticsNavItems,
  ...adminNavItems,
  ...legacyNavItems,
  ...payrollNavItems,
];



/** ETMS-primary group definitions (display order). */
export const ETMS_NAV_GROUPS: Omit<NavGroup, 'items'>[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, defaultExpanded: true },
  { id: 'tickets', label: 'Tickets', icon: Ticket, defaultExpanded: true, featureFlag: 'VITE_ENABLE_TICKETING' },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList, defaultExpanded: true, featureFlag: 'VITE_ENABLE_TICKET_ASSIGNMENTS' },
  { id: 'approvals', label: 'Approvals', icon: CheckSquare, defaultExpanded: false, featureFlag: 'VITE_ENABLE_APPROVAL_ENGINE' },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen, defaultExpanded: false, featureFlag: 'VITE_ENABLE_KNOWLEDGE_BASE' },
  { id: 'communications', label: 'Communications', icon: MessageSquare, defaultExpanded: false, featureFlag: 'VITE_ENABLE_COMMUNICATION_TRACKING' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, defaultExpanded: false, featureFlag: 'VITE_ENABLE_EXECUTIVE_ANALYTICS' },
  { id: 'notifications', label: 'Notifications', icon: Bell, defaultExpanded: false, featureFlag: 'VITE_ENABLE_NOTIFICATION_CENTER' },
  { id: 'administration', label: 'Administration', icon: Settings, defaultExpanded: false, roles: ['ADMIN', 'HR'] },
  { id: 'feedback', label: 'Feedback', icon: Star, defaultExpanded: false, featureFlag: 'VITE_ENABLE_TICKET_FEEDBACK' },
  { id: 'legacy-ems', label: 'Legacy EMS', icon: Archive, defaultExpanded: false, isLegacy: true },
];

/** Maps ETMS group id → nav item ids. */
export const ETMS_GROUP_ITEM_IDS: Record<string, string[]> = {
  dashboard: ['dashboard', 'operator-dashboard'],
  tickets: ['tickets-mine', 'tickets-team', 'tickets-all', 'tickets-create'],
  assignments: ['assignments-mine', 'assignments-team', 'assignments-workload'],
  approvals: ['approvals-pending', 'approvals-approved', 'approvals-rejected', 'approvals-dashboard', 'approvals-analytics'],
  'knowledge-base': ['kb-articles', 'kb-categories', 'kb-search', 'kb-analytics'],
  communications: ['comms-chat', 'comms-announcements', 'comms-discussions', 'comms-timeline', 'comms-analytics'],
  analytics: ['analytics-executive', 'analytics-sla', 'analytics-department', 'analytics-reports', 'analytics-bu'],
  notifications: ['notifications-center', 'notifications-analytics'],
  administration: ['admin-users', 'admin-departments', 'admin-roles', 'admin-settings'],
  feedback: ['feedback-analytics'],
  'legacy-ems': [
    'legacy-payroll',
    'legacy-attendance',
    'legacy-leaves',
    'legacy-projects',
    'legacy-meetups',
    'legacy-updates',
    'legacy-reports',
    'legacy-documents',
  ],
};

/** Legacy sidebar group display order (pre-ETMS navigation). */
export const LEGACY_GROUP_ORDER = [
  'Executive Overview',
  'Workforce Intelligence',
  'Operational Cycles',
  'Governance & Compliance',
  'Financial Orchestration',
  'Predictive Analytics',
  'Personalized Portal',
  'Human Capital Management',
  'Strategic Assets',
  'Service Management',
  'Work Queues',
  'Communications',
  'Approvals',
  'Knowledge Base',
  'Executive Analytics',
  'Notifications',
];

const navItemById = new Map(NAV_ITEMS.map((item) => [item.id, item]));

export function getNavItemById(id: string): NavItem | undefined {
  return navItemById.get(id);
}

export function resolveNavItems(ids: string[]): NavItem[] {
  return ids.map((id) => navItemById.get(id)).filter((item): item is NavItem => Boolean(item));
}
