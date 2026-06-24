import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tabs, TabsList } from '@/components/ui/tabs';
import { TicketFeedbackTabTrigger } from '../components/TicketFeedbackTab';
import type { Ticket } from '@/modules/ticketing/types/ticketing.types';

vi.mock('@/config/features', () => ({
  isTicketFeedbackEnabled: true,
}));

const closedTicket = {
  id: 'ticket-1',
  status: 'CLOSED',
} as Ticket;

const openTicket = {
  id: 'ticket-2',
  status: 'OPEN',
} as Ticket;

describe('TicketFeedbackTabTrigger', () => {
  it('renders Feedback tab for closed tickets when enabled', () => {
    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TicketFeedbackTabTrigger ticket={closedTicket} />
        </TabsList>
      </Tabs>
    );
    expect(screen.getByRole('tab', { name: 'Feedback' })).toBeInTheDocument();
  });

  it('does not render for open tickets', () => {
    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TicketFeedbackTabTrigger ticket={openTicket} />
        </TabsList>
      </Tabs>
    );
    expect(screen.queryByRole('tab', { name: 'Feedback' })).not.toBeInTheDocument();
  });
});

describe('TicketFeedbackTabTrigger with flag off', () => {
  it('returns null when feature flag is disabled', async () => {
    vi.resetModules();
    vi.doMock('@/config/features', () => ({ isTicketFeedbackEnabled: false }));
    const { TicketFeedbackTabTrigger: Trigger } = await import('../components/TicketFeedbackTab');
    const { container } = render(
      <Tabs defaultValue="overview">
        <TabsList>
          <Trigger ticket={closedTicket} />
        </TabsList>
      </Tabs>
    );
    expect(container.querySelector('[value="feedback"]')).toBeNull();
  });
});
