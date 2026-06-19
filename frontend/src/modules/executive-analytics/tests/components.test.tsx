import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DepartmentScorecard } from '../components/DepartmentScorecard';
import { BusinessUnitScorecard } from '../components/BusinessUnitScorecard';
import { AnalyticsFilters } from '../components/AnalyticsFilters';

describe('DepartmentScorecard', () => {
  it('empty state', () => {
    render(<DepartmentScorecard scorecards={[]} />);
    expect(screen.getByText(/No department data/)).toBeInTheDocument();
  });

  it('renders department', () => {
    render(<DepartmentScorecard scorecards={[{
      departmentId: 'd1', departmentName: 'HR', ticketVolume: 10,
      metrics: { slaCompliancePct: 88, csatScore: 4.5, escalations: 2, resolutionTimeHours: 8 },
    }]} />);
    expect(screen.getByText('HR')).toBeInTheDocument();
  });
});

describe('BusinessUnitScorecard', () => {
  it('renders table rows', () => {
    render(<BusinessUnitScorecard scorecards={[{
      businessUnit: 'Aparna Realty', ticketCount: 12, slaCompliancePct: 91,
      csatScore: 4.1, approvalTurnaroundHours: 18, resolutionTrend: 80,
    }]} />);
    expect(screen.getByText('Aparna Realty')).toBeInTheDocument();
  });
});

describe('AnalyticsFilters', () => {
  it('renders export buttons', () => {
    render(<AnalyticsFilters />);
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });
});
