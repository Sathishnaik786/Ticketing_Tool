import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { AiAssistPanel } from '../components/AiAssistPanel';

describe('AI Assist Co-Pilot Panel', () => {
  it('displays auto-generated summary and sentiment classifications', () => {
    const handleApply = vi.fn();
    render(
      <AiAssistPanel
        ticketTitle="VPN Access Denied"
        ticketDescription="I cannot log into the VPN client. It says credentials expired."
        onApplyResponse={handleApply}
      />
    );

    expect(screen.getByText('AI Co-Pilot Assist')).toBeInTheDocument();
    expect(screen.getByText('Requesting credential updates or system permissions clearance.')).toBeInTheDocument();
    expect(screen.getByText('NEUTRAL (Standard)')).toBeInTheDocument();
  });

  it('triggers apply callback when clicking suggest template button', () => {
    const handleApply = vi.fn();
    render(
      <AiAssistPanel
        ticketTitle="VPN Access Denied"
        ticketDescription="I cannot log into the VPN client. It says credentials expired."
        onApplyResponse={handleApply}
      />
    );

    const applyButtons = screen.getAllByRole('button', { name: /Apply/ });
    expect(applyButtons.length).toBeGreaterThan(0);
    fireEvent.click(applyButtons[0]);
    expect(handleApply).toHaveBeenCalled();
  });
});
