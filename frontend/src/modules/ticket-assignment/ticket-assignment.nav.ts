import { Inbox, Users, BarChart3 } from 'lucide-react';
import { isTicketAssignmentsEnabled } from '@/config/features';

export const ticketAssignmentNavGroups = isTicketAssignmentsEnabled
  ? [
      {
        label: 'Work Queues',
        items: [
          {
            title: 'My Queue',
            href: '/app/my-queue',
            icon: Inbox,
            roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'],
          },
          {
            title: 'Team Queue',
            href: '/app/team-queue',
            icon: Users,
            roles: ['ADMIN', 'HR', 'MANAGER'],
          },
          {
            title: 'Assignment Analytics',
            href: '/app/assignment-analytics',
            icon: BarChart3,
            roles: ['ADMIN', 'HR', 'MANAGER'],
          },
        ],
      },
    ]
  : [];
