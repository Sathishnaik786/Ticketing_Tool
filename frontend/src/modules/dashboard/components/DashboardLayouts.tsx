import * as React from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, RotateCcw, LayoutGrid, Check } from 'lucide-react';
import { toast } from 'sonner';

export interface DashboardLayoutsProps {
  onOpenSelector: () => void;
  activeWidgetIds: string[];
  onResetLayout: () => void;
}

export function DashboardLayouts({
  onOpenSelector,
  activeWidgetIds,
  onResetLayout,
}: DashboardLayoutsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-border/40 bg-muted/15 rounded-2xl">
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-4.5 w-4.5 text-primary" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Personalized Workspace layout
        </span>
        <span className="text-[10px] text-muted-foreground">
          ({activeWidgetIds.length} widgets active)
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSelector}
          className="text-xs h-8.5 rounded-xl border-border/60 hover:bg-muted"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
          Marketplace Catalog
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onResetLayout();
            toast.success('Dashboard layout reset to factory settings');
          }}
          className="text-xs h-8.5 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Reset Default
        </Button>
      </div>
    </div>
  );
}
export default DashboardLayouts;
