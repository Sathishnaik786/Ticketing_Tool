import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { PresenceIndicator } from '../components/PresenceIndicator';
import { TypingIndicator } from '../components/TypingIndicator';

describe('Collaboration Presence & Typing Indicators', () => {
  it('renders presence indicator state indicator correctly', () => {
    const { container } = render(
      <PresenceIndicator userId="user-online" isOnline={true} />
    );

    const badge = container.querySelector('.bg-emerald-500');
    expect(badge).toBeInTheDocument();
  });

  it('renders typing message for multiple active operators', () => {
    render(
      <TypingIndicator typingUsers={['David', 'Sarah']} />
    );

    expect(screen.getByText('David and Sarah are typing...')).toBeInTheDocument();
  });
});
