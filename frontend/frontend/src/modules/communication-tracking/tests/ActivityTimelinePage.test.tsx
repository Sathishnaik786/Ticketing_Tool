import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ActivityTimelinePage from '../pages/ActivityTimelinePage';

describe('ActivityTimelinePage', () => {
  it('renders page title', () => {
    render(
      <MemoryRouter>
        <ActivityTimelinePage />
      </MemoryRouter>
    );
    expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
  });
});
