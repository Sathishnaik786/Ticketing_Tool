import * as React from 'react';
import { Bookmark, Search, Clock, ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRecentSearches } from '@/utils/searchHistory.utils';
import { useTickets } from '@/modules/ticketing/hooks/useTicketing';

export function RecentItemsPanel() {
  const { data: ticketsResponse } = useTickets();
  const tickets = ticketsResponse?.data || [];

  const recentHistory = React.useMemo(() => getRecentSearches().slice(0, 3), []);
  const bookmarkedTickets = React.useMemo(() => tickets.slice(0, 3), [tickets]);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-4">
      {/* Bookmarks */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-1.5 border-b pb-2">
          <Bookmark className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          Pinned Tickets
        </h4>
        {bookmarkedTickets.length === 0 ? (
          <p className="text-[10px] text-muted-foreground italic pl-1">No pinned tickets.</p>
        ) : (
          <div className="space-y-2">
            {bookmarkedTickets.map((t: any) => (
              <Link
                key={t.id}
                to={`/app/tickets/${t.id}`}
                className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground truncate transition-colors"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{t.ticket_number || 'TKT'}: {t.title}</span>
                </span>
                <ChevronRight className="h-3 w-3 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Queries */}
      <div className="space-y-2 pt-2 border-t border-border/20">
        <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5 text-primary" />
          Recent Queries
        </h4>
        {recentHistory.length === 0 ? (
          <p className="text-[10px] text-muted-foreground italic pl-1">No recent searches.</p>
        ) : (
          <div className="space-y-1.5">
            {recentHistory.map((h, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="truncate">{h.query}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default RecentItemsPanel;
