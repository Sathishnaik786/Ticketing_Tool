import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCards } from '../components/KpiCards';

const kpis = {
  openTickets: 10,
  closedTickets: 20,
  totalTickets: 30,
  resolutionPct: 67,
  slaCompliancePct: 95,
  csatScore: 4.2,
  approvalTurnaroundHours: 24,
  knowledgeDeflectionPct: 55,
  averageResolutionHours: 12,
  escalationCount: 3,
  workloadDistribution: [],
};

describe('KpiCards', () => {
  it('renders open tickets', () => {
    render(<KpiCards kpis={kpis} />);
    expect(screen.getByText('Open Tickets').closest('div')?.textContent).toContain('10');
  });

  it('renders SLA compliance', () => {
    render(<KpiCards kpis={kpis} />);
    expect(screen.getByText('SLA Compliance %').closest('div')?.textContent).toContain('95%');
  });

  it('renders CSAT score', () => {
    render(<KpiCards kpis={kpis} />);
    expect(screen.getByText('CSAT Score').closest('div')?.textContent).toContain('4.2');
  });
});
