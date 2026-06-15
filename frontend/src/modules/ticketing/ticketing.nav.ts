import type { ElementType } from 'react';
import { Ticket, PlusCircle } from 'lucide-react';
import { isTicketingEnabled } from '@/config/features';

interface NavItem {
  title: string;
  href: string;
  icon: ElementType;
  roles?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const ticketingNavGroups: NavGroup[] = isTicketingEnabled
  ? [
      {
        label: 'Service Management',
        items: [
          {
            title: 'Tickets',
            href: '/app/tickets',
            icon: Ticket,
            roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'],
          },
          {
            title: 'Create Ticket',
            href: '/app/tickets/new',
            icon: PlusCircle,
            roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'],
          },
        ],
      },
    ]
  : [];
