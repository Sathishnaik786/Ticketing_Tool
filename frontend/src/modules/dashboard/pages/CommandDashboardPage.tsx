import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEtmsDashboard } from '../hooks/useEtmsDashboard';
import { EtmsKpiGrid } from '../components/EtmsKpiGrid';
import { TicketStatusChart } from '../components/TicketStatusChart';
import { DepartmentPerformancePanel } from '../components/DepartmentPerformancePanel';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { PendingApprovalsWidget } from '../components/PendingApprovalsWidget';
import { KnowledgeStatsWidget } from '../components/KnowledgeStatsWidget';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { PageHeader } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isTicketingEnabled } from '@/config/features';
import { ComponentErrorBoundary } from '@/components/common/ComponentErrorBoundary';

// Import Marketplace Components
import { DashboardLayouts } from '../components/DashboardLayouts';
import { WidgetSelector, type WidgetCatalogItem } from '../components/WidgetSelector';
import { WidgetSettingsDrawer, type WidgetSettings } from '../components/WidgetSettingsDrawer';

const WIDGET_STORAGE_KEY = 'ticketra_dashboard_active_widgets';
const WIDGET_SETTINGS_KEY = 'ticketra_dashboard_widget_settings';

const DEFAULT_WIDGETS = [
  'kpi-grid',
  'status-chart',
  'dept-performance',
  'pending-approvals',
  'knowledge-stats',
  'activity-feed',
];

const WIDGET_CATALOG: WidgetCatalogItem[] = [
  { id: 'kpi-grid', name: 'KPI Stats Grid', description: 'Aggregates open tickets, average response delays, and SLA target breach counters.', category: 'Metrics' },
  { id: 'status-chart', name: 'Ticket Status Chart', description: 'Renders status transitions and distribution details.', category: 'Charts' },
  { id: 'dept-performance', name: 'Department Performance Panel', description: 'Lists ticket load and performance statistics by department.', category: 'Operations' },
  { id: 'pending-approvals', name: 'Pending Approvals Widget', description: 'Summarizes approval pipelines requiring manager authorization.', category: 'Approvals' },
  { id: 'knowledge-stats', name: 'Knowledge Stats Widget', description: 'Summarizes bookmarks, ratings, and popular guides statistics.', category: 'Knowledge' },
  { id: 'activity-feed', name: 'Recent Activity Feed', description: 'Audit trail logging state changes and assignee updates.', category: 'Audit' },
];

const DEFAULT_SETTINGS: Record<string, WidgetSettings> = {
  'activity-feed': { limit: 5, refreshRate: 30, showAnalytics: true },
  'pending-approvals': { limit: 4, refreshRate: 30, showAnalytics: true },
};

export default function CommandDashboardPage() {
  const { user } = useAuth();
  const {
    kpis,
    ticketStatus,
    departmentPerformance,
    activities,
    pendingApprovals,
    knowledgeStats,
    loading,
    error
  } = useEtmsDashboard();

  // Load layout from localStorage
  const [activeWidgetIds, setActiveWidgetIds] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WIDGET_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  // Load settings from localStorage
  const [widgetSettings, setWidgetSettings] = React.useState<Record<string, WidgetSettings>>(() => {
    try {
      const saved = localStorage.getItem(WIDGET_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [isSelectorOpen, setIsSelectorOpen] = React.useState(false);
  const [editingWidgetId, setEditingWidgetId] = React.useState<string | null>(null);

  // Sync active widgets to localStorage
  const saveLayout = (updatedIds: string[]) => {
    setActiveWidgetIds(updatedIds);
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(updatedIds));
  };

  const handleToggleWidget = (id: string) => {
    const updated = activeWidgetIds.includes(id)
      ? activeWidgetIds.filter((wId) => wId !== id)
      : [...activeWidgetIds, id];
    saveLayout(updated);
  };

  const handleResetLayout = () => {
    saveLayout(DEFAULT_WIDGETS);
    setWidgetSettings(DEFAULT_SETTINGS);
    localStorage.setItem(WIDGET_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  };

  const handleSaveWidgetSettings = (updated: WidgetSettings) => {
    if (!editingWidgetId) return;
    const next = { ...widgetSettings, [editingWidgetId]: updated };
    setWidgetSettings(next);
    localStorage.setItem(WIDGET_SETTINGS_KEY, JSON.stringify(next));
  };

  if (loading || !user) {
    return <DashboardSkeleton />;
  }

  const isAdmin = user.role === 'ADMIN';
  const isManager = user.role === 'MANAGER';
  const isHR = user.role === 'HR';

  // Role based visibility conditions
  const showAnalyticsAndCharts = isAdmin || isManager || isHR;
  const showApprovals = isAdmin || isManager;
  const showDeptPerformance = isAdmin || isManager || isHR;

  // Active settings configuration matching
  const feedLimit = widgetSettings['activity-feed']?.limit || 5;
  const approvalsLimit = widgetSettings['pending-approvals']?.limit || 4;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ticketra Command Center"
        description="Unified Enterprise Ticket Management System — real-time service operations"
        breadcrumbs={[{ label: 'Command Dashboard' }]}
        actions={
          isTicketingEnabled ? (
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <Link to="/app/tickets/new">
                <Plus className="h-4 w-4 mr-1" aria-hidden />
                Create Ticket
              </Link>
            </Button>
          ) : undefined
        }
      />

      {/* Personalized marketplace Layout bar */}
      <DashboardLayouts
        onOpenSelector={() => setIsSelectorOpen(true)}
        activeWidgetIds={activeWidgetIds}
        onResetLayout={handleResetLayout}
      />

      {/* KPI Stats Grid */}
      {activeWidgetIds.includes('kpi-grid') && kpis && (
        <ComponentErrorBoundary name="EtmsKpiGrid">
          <EtmsKpiGrid kpis={kpis} />
        </ComponentErrorBoundary>
      )}
 
      {/* Main Charts & Performance Section */}
      {showAnalyticsAndCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeWidgetIds.includes('status-chart') && (
            <ComponentErrorBoundary name="TicketStatusChart">
              <TicketStatusChart stats={ticketStatus} />
            </ComponentErrorBoundary>
          )}
          {activeWidgetIds.includes('dept-performance') && showDeptPerformance && (
            <ComponentErrorBoundary name="DepartmentPerformancePanel">
              <DepartmentPerformancePanel performanceList={departmentPerformance} />
            </ComponentErrorBoundary>
          )}
        </div>
      )}
 
      {/* Bottom widgets section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Approvals Widget */}
        {activeWidgetIds.includes('pending-approvals') && (
          <ComponentErrorBoundary name="PendingApprovalsWidget">
            <div className="relative group">
              <button
                onClick={() => setEditingWidgetId('pending-approvals')}
                className="absolute right-4 top-4 z-10 p-1.5 rounded-lg border border-border/20 bg-card hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                title="Widget Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
              {showApprovals ? (
                <PendingApprovalsWidget approvals={pendingApprovals.slice(0, approvalsLimit)} />
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-5 flex flex-col justify-center text-center h-full min-h-[300px]">
                  <h4 className="text-sm font-semibold text-slate-400">Employee Workspace</h4>
                  <p className="text-xs text-muted-foreground mt-1">Submit tickets and tracking queues</p>
                </div>
              )}
            </div>
          </ComponentErrorBoundary>
        )}
 
        {/* Knowledge Base Widget */}
        {activeWidgetIds.includes('knowledge-stats') && (
          <ComponentErrorBoundary name="KnowledgeStatsWidget">
            <KnowledgeStatsWidget stats={knowledgeStats} />
          </ComponentErrorBoundary>
        )}
 
        {/* Recent Activity Feed */}
        {activeWidgetIds.includes('activity-feed') && (
          <ComponentErrorBoundary name="RecentActivityFeed">
            <div className="relative group">
              <button
                onClick={() => setEditingWidgetId('activity-feed')}
                className="absolute right-4 top-4 z-10 p-1.5 rounded-lg border border-border/20 bg-card hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                title="Widget Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
              <RecentActivityFeed activities={activities.slice(0, feedLimit)} />
            </div>
          </ComponentErrorBoundary>
        )}
      </div>

      {/* Marketplace Selector Modal Drawer */}
      <WidgetSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        catalog={WIDGET_CATALOG}
        activeWidgetIds={activeWidgetIds}
        onToggleWidget={handleToggleWidget}
      />

      {/* Widget Settings Drawer panel */}
      {editingWidgetId && (
        <WidgetSettingsDrawer
          isOpen={editingWidgetId !== null}
          onClose={() => setEditingWidgetId(null)}
          widgetName={WIDGET_CATALOG.find((w) => w.id === editingWidgetId)?.name || ''}
          settings={widgetSettings[editingWidgetId] || { limit: 5, refreshRate: 30, showAnalytics: true }}
          onSaveSettings={handleSaveWidgetSettings}
        />
      )}
    </div>
  );
}
export { CommandDashboardPage };
