import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { PendingApprovalItem } from '../types/dashboard.types';

interface PendingApprovalsWidgetProps {
  approvals?: PendingApprovalItem[];
  loading?: boolean;
}

export function PendingApprovalsWidget({ approvals = [], loading = false }: PendingApprovalsWidgetProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 animate-pulse">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = approvals.length === 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between min-h-[320px]">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Pending Approvals</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Catalog requests awaiting sign-off</p>
          </div>
          {!isEmpty && (
            <span className="inline-flex items-center justify-center h-5 px-2 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
              {approvals.length} pending
            </span>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center" role="status">
          <CheckCircle2 className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No pending approvals.</p>
          <p className="text-xs text-muted-foreground mt-1">All service desk change actions are up to date.</p>
        </div>
      ) : (
        <div className="flex-1 mt-4 flex flex-col justify-between">
          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/50">
            {approvals.slice(0, 3).map((app, index) => (
              <div
                key={app.id}
                className={cn(
                  'flex items-center justify-between gap-3',
                  index > 0 ? 'pt-3' : ''
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{app.category}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Requested by <span className="font-medium text-slate-700 dark:text-slate-300">{app.requester}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {new Date(app.requestDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                  <span className="inline-flex items-center text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    Awaiting Sign-off
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 h-8 flex items-center gap-1"
              asChild
            >
              <Link to="/app/approvals">
                Go to Approvals Queue
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline helper for styles conditional checks
import { cn } from '@/lib/utils';
