import * as React from 'react';
import { Sparkles } from 'lucide-react';

export interface SearchSuggestionsProps {
  suggestions: string[];
  onSelect: (val: string) => void;
}

export function SearchSuggestions({ suggestions, onSelect }: SearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-1.5 px-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        Popular Searches
      </h4>

      <div className="flex flex-wrap gap-1.5 px-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSelect(suggestion)}
            className="text-[10px] font-bold px-3 py-1.5 bg-primary/5 text-primary border border-primary/10 hover:bg-primary hover:text-white rounded-lg transition-all"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
export default SearchSuggestions;
