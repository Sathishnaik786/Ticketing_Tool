import * as React from 'react';
import { Clock, X, Trash2 } from 'lucide-react';
import type { SearchHistoryEntry } from '@/utils/searchHistory.utils';
import { Button } from '@/components/ui/button';

export interface SearchRecentHistoryProps {
  history: SearchHistoryEntry[];
  onSelect: (entry: SearchHistoryEntry) => void;
  onClear: () => void;
}

export function SearchRecentHistory({ history, onSelect, onClear }: SearchRecentHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Recent Searches
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-6 text-[9px] font-black text-rose-500 uppercase tracking-widest px-2 rounded hover:bg-rose-500/5"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear History
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-1">
        {history.map((entry, i) => (
          <button
            key={i}
            onClick={() => onSelect(entry)}
            className="flex items-center gap-3 p-2.5 text-xs text-left text-muted-foreground hover:text-foreground rounded-xl border border-border/20 bg-muted/5 hover:bg-muted/30 transition-all font-medium group"
          >
            <Clock className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
            <span className="truncate flex-1">{entry.query}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
export default SearchRecentHistory;
