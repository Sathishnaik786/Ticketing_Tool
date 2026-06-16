import { BarChart3 } from 'lucide-react';
import { isTicketFeedbackEnabled } from '@/config/features';

export const ticketFeedbackNavGroups = isTicketFeedbackEnabled
  ? [
      {
        label: 'Service Management',
        items: [
          {
            title: 'Feedback Analytics',
            href: '/app/feedback-analytics',
            icon: BarChart3,
            roles: ['ADMIN', 'HR', 'MANAGER'],
          },
        ],
      },
    ]
  : [];
