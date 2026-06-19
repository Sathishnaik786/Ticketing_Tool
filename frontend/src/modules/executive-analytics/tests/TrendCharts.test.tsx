import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendCharts } from '../components/TrendCharts';

describe('TrendCharts', () => {
  it('shows empty message', () => {
    render(<TrendCharts monthly={[]} />);
    expect(screen.getByText(/No trend data/)).toBeInTheDocument();
  });

  it('renders monthly rows', () => {
    render(<TrendCharts monthly={[{ month: '2026-01', created: 5, closed: 3 }]} />);
    expect(screen.getByText('2026-01')).toBeInTheDocument();
    expect(screen.getByText(/Created 5/)).toBeInTheDocument();
  });
});
