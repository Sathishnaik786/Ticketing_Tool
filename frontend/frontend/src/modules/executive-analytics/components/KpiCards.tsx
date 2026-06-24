import type { ExecutiveKpis } from '../services/executiveAnalyticsService';

interface KpiCardsProps {
  kpis: ExecutiveKpis;
}

const cards: Array<{ key: keyof ExecutiveKpis; label: string; suffix?: string }> = [
  { key: 'openTickets', label: 'Open Tickets' },
  { key: 'closedTickets', label: 'Closed Tickets' },
  { key: 'resolutionPct', label: 'Resolution %', suffix: '%' },
  { key: 'slaCompliancePct', label: 'SLA Compliance %', suffix: '%' },
  { key: 'csatScore', label: 'CSAT Score' },
  { key: 'approvalTurnaroundHours', label: 'Approval Turnaround (hrs)' },
  { key: 'knowledgeDeflectionPct', label: 'Knowledge Deflection %', suffix: '%' },
  { key: 'averageResolutionHours', label: 'Avg Resolution (hrs)' },
  { key: 'escalationCount', label: 'Escalations' },
];

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ key, label, suffix }) => (
        <div key={key} className="rounded-lg border p-4">
          <p className="text-xs uppercase text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold mt-1">
            {String(kpis[key])}{suffix ?? ''}
          </p>
        </div>
      ))}
    </div>
  );
}
