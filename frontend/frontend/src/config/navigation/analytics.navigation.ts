import type { NavItem } from './types';
import {
  LayoutDashboard, Ticket, PlusCircle, Inbox, Users, BarChart3, CheckSquare, ClipboardCheck, BookOpen, FileEdit, MessageSquare, Activity, Bell, Settings, Building2, ShieldCheck, CreditCard, Calendar, Clock, FileText, FolderKanban, Users2, Sparkles, Archive, User, LayoutTemplate, ClipboardList, Calculator, Database, FileUp, Layers, FileSpreadsheet, Star,
} from './icons';

export const analyticsNavItems: NavItem[] = [
// ── Analytics ────────────────────────────────────────────────────────────
  {
    id: 'analytics-executive',
    title: 'Executive Dashboard',
    href: '/app/executive-dashboard',
    icon: BarChart3,
    roles: ['HR', 'ADMIN', 'SUPER_ADMIN'],
    featureFlag: 'VITE_ENABLE_EXECUTIVE_ANALYTICS',
    keywords: ['executive', 'analytics', 'bi'],
    searchPriority: 12,
    legacyGroup: 'Executive Analytics',
  },
  {
    id: 'analytics-sla',
    title: 'SLA Dashboard',
    href: '/app/sla-dashboard',
    icon: ShieldCheck,
    roles: ['HR', 'ADMIN', 'SUPER_ADMIN', 'MANAGER'],
    featureFlag: 'VITE_ENABLE_ETMS_DASHBOARD',
    keywords: ['sla', 'breach', 'compliance'],
    searchPriority: 14,
  },
  {
    id: 'analytics-department',
    title: 'Department Analytics',
    href: '/app/department-analytics',
    icon: Building2,
    roles: ['MANAGER', 'HR', 'ADMIN', 'SUPER_ADMIN'],
    featureFlag: 'VITE_ENABLE_EXECUTIVE_ANALYTICS',
    legacyGroup: 'Executive Analytics',
  },
  {
    id: 'analytics-bu',
    title: 'Business Unit Analytics',
    href: '/app/business-unit-analytics',
    icon: Layers,
    roles: ['HR', 'ADMIN', 'SUPER_ADMIN'],
    featureFlag: 'VITE_ENABLE_EXECUTIVE_ANALYTICS',
    legacyGroup: 'Executive Analytics',
  },
  {
    id: 'analytics-reports',
    title: 'Analytics Reports',
    href: '/app/analytics-reports',
    icon: FileSpreadsheet,
    roles: ['MANAGER', 'HR', 'ADMIN', 'SUPER_ADMIN'],
    featureFlag: 'VITE_ENABLE_EXECUTIVE_ANALYTICS',
    legacyGroup: 'Executive Analytics',
  },
];
