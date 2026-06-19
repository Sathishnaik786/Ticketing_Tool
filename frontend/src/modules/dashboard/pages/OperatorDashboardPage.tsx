import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Inbox, AlertTriangle, Clock } from 'lucide-react';
import { isTicketingEnabled, isTicketAssignmentsEnabled } from '@/config/features';

export default function OperatorDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Operator Dashboard"
        description="Your daily work surface — assigned tickets, overdue items, and pending actions."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Assigned To Me', value: '—', icon: Inbox, href: '/app/my-queue' },
          { label: 'Overdue', value: '—', icon: AlertTriangle, href: '/app/my-queue' },
          { label: 'Pending Actions', value: '—', icon: Clock, href: '/app/my-approvals' },
        ].map((card) => (
          <Link
            key={card.label}
            to={card.href}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <card.icon className="h-5 w-5 text-blue-600 mb-3" aria-hidden />
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {isTicketAssignmentsEnabled && (
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/app/my-queue">Open My Queue</Link>
          </Button>
        )}
        {isTicketingEnabled && (
          <Button asChild className="rounded-xl">
            <Link to="/app/tickets/new">Create Ticket</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
