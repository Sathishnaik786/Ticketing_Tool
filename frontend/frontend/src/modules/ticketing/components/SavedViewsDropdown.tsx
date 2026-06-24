import * as React from 'react';
import { Bookmark, Plus, Edit2, Trash2, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { MultiSelectFilters } from './TicketFilterBar';

export interface SavedView {
  id: string;
  name: string;
  filters: MultiSelectFilters;
  search: string;
  isDefault?: boolean;
}

const DEFAULT_VIEWS: SavedView[] = [
  {
    id: 'my-open',
    name: 'My Open Tickets',
    search: '',
    filters: {
      statuses: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED', 'ESCALATED'],
      priorities: [],
      departments: [],
      assignees: [], // Dynamic filter applied in list page
      categories: [],
      slaStatus: [],
      tags: [],
      watchers: [],
      dateRange: null,
    },
  },
  {
    id: 'high-priority',
    name: 'High Priority',
    search: '',
    filters: {
      statuses: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED', 'ESCALATED'],
      priorities: ['HIGH', 'CRITICAL'],
      departments: [],
      assignees: [],
      categories: [],
      slaStatus: [],
      tags: [],
      watchers: [],
      dateRange: null,
    },
  },
  {
    id: 'waiting-approval',
    name: 'Waiting For Approval',
    search: '',
    filters: {
      statuses: ['PENDING_USER'],
      priorities: [],
      departments: [],
      assignees: [],
      categories: [],
      slaStatus: [],
      tags: [],
      watchers: [],
      dateRange: null,
    },
  },
  {
    id: 'overdue-tickets',
    name: 'Overdue Tickets',
    search: '',
    filters: {
      statuses: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED', 'ESCALATED'],
      priorities: [],
      departments: [],
      assignees: [],
      categories: [],
      slaStatus: ['breached'],
      tags: [],
      watchers: [],
      dateRange: null,
    },
  },
  {
    id: 'recently-updated',
    name: 'Recently Updated',
    search: '',
    filters: {
      statuses: [],
      priorities: [],
      departments: [],
      assignees: [],
      categories: [],
      slaStatus: [],
      tags: [],
      watchers: [],
      dateRange: null,
    },
  },
];

interface SavedViewsDropdownProps {
  currentFilters: MultiSelectFilters;
  currentSearch: string;
  onSelectView: (view: SavedView) => void;
}

export function SavedViewsDropdown({
  currentFilters,
  currentSearch,
  onSelectView,
}: SavedViewsDropdownProps) {
  const [customViews, setCustomViews] = React.useState<SavedView[]>([]);
  const [selectedViewId, setSelectedViewId] = React.useState<string>('');
  const [isSaveOpen, setIsSaveOpen] = React.useState(false);
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [viewName, setViewName] = React.useState('');
  const [renameTargetId, setRenameTargetId] = React.useState('');

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('ticketra_saved_views');
      if (stored) {
        setCustomViews(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved views', e);
    }
  }, []);

  const saveViewsToStorage = (views: SavedView[]) => {
    setCustomViews(views);
    localStorage.setItem('ticketra_saved_views', JSON.stringify(views));
  };

  const handleCreateView = () => {
    if (!viewName.trim()) return;
    const newView: SavedView = {
      id: `custom-${Date.now()}`,
      name: viewName,
      filters: { ...currentFilters },
      search: currentSearch,
    };
    const nextViews = [...customViews, newView];
    saveViewsToStorage(nextViews);
    setSelectedViewId(newView.id);
    setViewName('');
    setIsSaveOpen(false);
  };

  const handleRenameView = () => {
    if (!viewName.trim() || !renameTargetId) return;
    const nextViews = customViews.map((v) =>
      v.id === renameTargetId ? { ...v, name: viewName } : v
    );
    saveViewsToStorage(nextViews);
    setViewName('');
    setIsRenameOpen(false);
  };

  const handleDeleteView = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextViews = customViews.filter((v) => v.id !== id);
    saveViewsToStorage(nextViews);
    if (selectedViewId === id) {
      setSelectedViewId('');
    }
  };

  const handleSelectView = (view: SavedView) => {
    setSelectedViewId(view.id);
    onSelectView(view);
  };

  const currentViewName =
    DEFAULT_VIEWS.find((v) => v.id === selectedViewId)?.name ??
    customViews.find((v) => v.id === selectedViewId)?.name ??
    'Saved Views';

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 h-10 border-input">
            <Bookmark className="h-4 w-4 text-primary" />
            <span>{currentViewName}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>System Views</DropdownMenuLabel>
          {DEFAULT_VIEWS.map((view) => (
            <DropdownMenuItem
              key={view.id}
              onClick={() => handleSelectView(view)}
              className="flex justify-between items-center cursor-pointer"
            >
              <span>{view.name}</span>
              {selectedViewId === view.id && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <div className="flex justify-between items-center px-2 py-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase">Custom Views</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSaveOpen(true)}
              className="h-6 w-6 p-0 hover:bg-muted"
              title="Save current filters as view"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {customViews.length === 0 ? (
            <div className="text-xs text-muted-foreground px-2 py-1.5 italic">
              No custom views saved.
            </div>
          ) : (
            customViews.map((view) => (
              <DropdownMenuItem
                key={view.id}
                onClick={() => handleSelectView(view)}
                className="flex justify-between items-center group cursor-pointer"
              >
                <span className="truncate mr-2">{view.name}</span>
                <div className="flex gap-1">
                  <Edit2
                    className="h-3 w-3 opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameTargetId(view.id);
                      setViewName(view.name);
                      setIsRenameOpen(true);
                    }}
                  />
                  <Trash2
                    className="h-3 w-3 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    onClick={(e) => handleDeleteView(view.id, e)}
                  />
                  {selectedViewId === view.id && <Check className="h-4 w-4 text-primary ml-1" />}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save view modal */}
      <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current Filters as View</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="View Name (e.g. Finance Breached Tickets)"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              aria-label="View name"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateView} disabled={!viewName.trim()}>
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename view modal */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Saved View</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="New View Name"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              aria-label="New view name"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameView} disabled={!viewName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
