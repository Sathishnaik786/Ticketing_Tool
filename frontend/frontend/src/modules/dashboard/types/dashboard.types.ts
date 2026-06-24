import type { LucideIcon } from 'lucide-react';

export interface DashboardKpis {
  totalTickets: number;
  openTickets: number;
  assignedTickets: number;
  overdueTickets: number;
  resolvedToday: number;
  slaCompliancePercent: number;
  pendingApprovals: number;
  knowledgeArticles: number;
  teamPerformanceScore: number;
}

export interface TicketStatusData {
  open: number;
  inProgress: number;
  waiting: number;
  resolved: number;
  closed: number;
}

export interface DepartmentPerformanceData {
  department: string;
  open: number;
  avgResolutionHours: number;
  slaPercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RecentActivityItem {
  id: string;
  type: 'created' | 'assigned' | 'comment' | 'status_change' | 'approval_complete' | 'sla_breach' | 'info';
  message: string;
  timestamp: string;
  user?: {
    name: string;
    avatarUrl?: string;
    department?: string;
  };
}

export interface PendingApprovalItem {
  id: string;
  requester: string;
  category: string;
  requestDate: string;
  status: string;
}

export interface KnowledgeStats {
  totalArticles: number;
  helpfulRatingsPercent: number;
  topCategories: Array<{ category: string; count: number }>;
}

export interface EtmsDashboardStats {
  kpis: DashboardKpis;
  ticketStatus: TicketStatusData;
  departmentPerformance: DepartmentPerformanceData[];
  activities: RecentActivityItem[];
  pendingApprovals: PendingApprovalItem[];
  knowledgeStats: KnowledgeStats;
  isDemoData: boolean;
}
