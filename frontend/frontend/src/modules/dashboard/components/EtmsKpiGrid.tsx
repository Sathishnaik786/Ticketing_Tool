import {
  Ticket,
  UserCheck,
  CheckCircle,
  ShieldCheck,
  Clock,
  BookOpen
} from 'lucide-react';
import { MetricCard } from '@/components/design-system';
import type { DashboardKpis } from '../types/dashboard.types';

interface EtmsKpiGridProps {
  kpis: DashboardKpis;
}

export function EtmsKpiGrid({ kpis }: EtmsKpiGridProps) {
  const items = [
    {
      label: 'Open Tickets',
      value: kpis.openTickets.toLocaleString(),
      icon: Ticket,
      tone: 'primary' as const,
      trend: { value: 'Active queue', direction: 'neutral' as const }
    },
    {
      label: 'Assigned Tickets',
      value: kpis.assignedTickets.toLocaleString(),
      icon: UserCheck,
      tone: 'primary' as const,
      trend: { value: 'Assigned to you', direction: 'neutral' as const }
    },
    {
      label: 'Resolved Today',
      value: kpis.resolvedToday.toLocaleString(),
      icon: CheckCircle,
      tone: 'success' as const,
      trend: { value: '+4% from avg', direction: 'up' as const }
    },
    {
      label: 'SLA Compliance',
      value: `${kpis.slaCompliancePercent}%`,
      icon: ShieldCheck,
      tone: kpis.slaCompliancePercent >= 90 ? ('success' as const) : ('danger' as const),
      trend: { value: 'Target >= 90%', direction: 'neutral' as const }
    },
    {
      label: 'Pending Approvals',
      value: kpis.pendingApprovals.toLocaleString(),
      icon: Clock,
      tone: 'warning' as const,
      trend: { value: 'Awaiting action', direction: 'neutral' as const }
    },
    {
      label: 'Knowledge Articles',
      value: kpis.knowledgeArticles.toLocaleString(),
      icon: BookOpen,
      tone: 'neutral' as const,
      trend: { value: 'Published count', direction: 'neutral' as const }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <MetricCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
          tone={item.tone}
          trend={item.trend}
        />
      ))}
    </div>
  );
}
