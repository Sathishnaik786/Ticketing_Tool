import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEtmsDashboard } from '../hooks/useEtmsDashboard';
import { EtmsKpiGrid } from '../components/EtmsKpiGrid';
import { TicketStatusChart } from '../components/TicketStatusChart';
import { DepartmentPerformancePanel } from '../components/DepartmentPerformancePanel';
import { EtmsActivityFeed } from '../components/EtmsActivityFeed';
import { Plus } from 'lucide-react';
import { isTicketingEnabled } from '@/config/features';

export function EtmsCommandDashboard() {
  const { data: stats, isLoading } = useEtmsDashboard();

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ticketra Command Center"
        description="Enterprise Ticket Management System — real-time service operations"
        actions={
          <div className="flex items-center gap-2">
            {stats.isDemoData && (
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Demo Data
              </span>
            )}
            {isTicketingEnabled ? (
              <Button asChild size="sm" className="rounded-xl">
                <Link to="/app/tickets/new">
                  <Plus className="h-4 w-4 mr-1" aria-hidden />
                  Create Ticket
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <EtmsKpiGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TicketStatusChart stats={stats} />
        <DepartmentPerformancePanel stats={stats} />
      </div>

      <EtmsActivityFeed stats={stats} />
    </div>
  );
}
