import * as React from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AiSuggestionsCardProps {
  title: string;
  description: string;
  onSuggestPriority?: (priority: string) => void;
  onSuggestCategory?: (categoryId: string) => void;
}

export function AiSuggestionsCard({
  title,
  description,
  onSuggestPriority,
  onSuggestCategory,
}: AiSuggestionsCardProps) {
  const text = (title + ' ' + description).toLowerCase();

  // Heuristic recommendations
  const suggestedPriority = React.useMemo(() => {
    if (text.includes('urgent') || text.includes('production crash') || text.includes('security breach')) {
      return 'CRITICAL';
    }
    if (text.includes('slow') || text.includes('broken') || text.includes('error')) {
      return 'HIGH';
    }
    return 'MEDIUM';
  }, [text]);

  const suggestedCategory = React.useMemo(() => {
    if (text.includes('access') || text.includes('permission') || text.includes('login') || text.includes('password')) {
      return { name: 'IT Access & Credentials', id: 'cat-access' };
    }
    if (text.includes('screen') || text.includes('hardware') || text.includes('monitor') || text.includes('laptop')) {
      return { name: 'Hardware & Devices Support', id: 'cat-hardware' };
    }
    return null;
  }, [text]);

  if (suggestedPriority === 'MEDIUM' && !suggestedCategory) return null;

  return (
    <div className="rounded-xl border border-blue-100 dark:border-blue-900/20 bg-blue-500/[0.01] p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
        <Sparkles className="h-3.5 w-3.5" />
        AI Form Configuration Suggestions
      </div>

      <div className="space-y-2">
        {suggestedPriority !== 'MEDIUM' && onSuggestPriority && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Suggest priority shift to <strong className="text-foreground">{suggestedPriority}</strong></span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSuggestPriority(suggestedPriority)}
              className="h-7 text-[10px] text-blue-600 hover:bg-blue-500/5 px-2 rounded-lg"
            >
              <Check className="h-3 w-3 mr-1" /> Apply
            </Button>
          </div>
        )}

        {suggestedCategory && onSuggestCategory && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Suggest category <strong className="text-foreground">{suggestedCategory.name}</strong></span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSuggestCategory(suggestedCategory.id)}
              className="h-7 text-[10px] text-blue-600 hover:bg-blue-500/5 px-2 rounded-lg"
            >
              <Check className="h-3 w-3 mr-1" /> Apply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
export default AiSuggestionsCard;
