import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tabs, TabsList } from '@/components/ui/tabs';
import {
  TicketCommunicationTabTrigger,
  TicketActivityTimelineTabTrigger,
} from '../components/TicketCommunicationTab';

vi.mock('@/config/features', () => ({ isCommunicationTrackingEnabled: true }));

describe('TicketCommunicationTab triggers', () => {
  it('renders Communication tab trigger when enabled', () => {
    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TicketCommunicationTabTrigger />
        </TabsList>
      </Tabs>
    );
    expect(screen.getByText('Communication')).toBeInTheDocument();
  });

  it('renders Activity Timeline tab trigger when enabled', () => {
    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TicketActivityTimelineTabTrigger />
        </TabsList>
      </Tabs>
    );
    expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
  });
});
