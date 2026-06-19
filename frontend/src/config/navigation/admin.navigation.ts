import type { NavItem } from './types';
import {
  LayoutDashboard, Ticket, PlusCircle, Inbox, Users, BarChart3, CheckSquare, ClipboardCheck, BookOpen, FileEdit, MessageSquare, Activity, Bell, Settings, Building2, ShieldCheck, CreditCard, Calendar, Clock, FileText, FolderKanban, Users2, Sparkles, Archive, User, LayoutTemplate, ClipboardList, Calculator, Database, FileUp, Layers, FileSpreadsheet, Star,
} from './icons';

export const adminNavItems: NavItem[] = [
// ── Notifications ─────────────────────────────────────────────────────────
  {
    id: 'notifications-center',
    title: 'Notifications',
    href: '/app/notifications',
    icon: Bell,
    featureFlag: 'VITE_ENABLE_NOTIFICATION_CENTER',
    keywords: ['notifications', 'alerts'],
    searchPriority: 4,
    legacyGroup: 'Notifications',
  },
  {
    id: 'notifications-analytics',
    title: 'Notification Analytics',
    href: '/app/notification-analytics',
    icon: BarChart3,
    roles: ['MANAGER', 'HR', 'ADMIN', 'SUPER_ADMIN'],
    featureFlag: 'VITE_ENABLE_NOTIFICATION_CENTER',
    legacyGroup: 'Notifications',
  },

  // ── Administration ────────────────────────────────────────────────────────
  {
    id: 'admin-users',
    title: 'Users',
    href: '/app/admin/users',
    icon: Users,
    roles: ['ADMIN'],
    keywords: ['admin', 'users'],
    searchPriority: 40,
  },
  {
    id: 'admin-departments',
    title: 'Departments',
    href: '/app/departments',
    icon: Building2,
    keywords: ['departments', 'org'],
    searchPriority: 41,
    legacyGroup: 'Human Capital Management',
  },
  {
    id: 'admin-settings',
    title: 'Settings',
    href: '/app/payroll/settings',
    icon: Settings,
    roles: ['ADMIN'],
    keywords: ['settings', 'platform'],
    searchPriority: 50,
    legacyGroup: 'Strategic Assets',
  },

  // ── Feedback ──────────────────────────────────────────────────────────────
  {
    id: 'feedback-analytics',
    title: 'Feedback Analytics',
    href: '/app/feedback-analytics',
    icon: Star,
    roles: ['ADMIN', 'HR', 'MANAGER'],
    featureFlag: 'VITE_ENABLE_TICKET_FEEDBACK',
    legacyGroup: 'Service Management',
  },
];
