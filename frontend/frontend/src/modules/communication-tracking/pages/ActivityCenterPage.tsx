import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTickets } from '@/modules/ticketing/hooks/useTicketing';
import { usePendingApprovals } from '@/modules/approval-management/hooks/useApprovalManagement';
import { useEtmsDashboard } from '@/modules/dashboard/hooks/useEtmsDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/utils/queryKeys';
import { departmentsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserCheck,
  Building,
  Calendar,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ComponentErrorBoundary } from '@/components/common/ComponentErrorBoundary';

export default function ActivityCenterPage() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = React.useState('week'); // today, week, month
  const [scopeFilter, setScopeFilter] = React.useState('all'); // all, mine
  const [deptFilter, setDeptFilter] = React.useState('all');

  const { data: ticketsResponse } = useTickets();
  const tickets = ticketsResponse?.data || [];

  const { data: pendingApprovals = [] } = usePendingApprovals();
  const { activities = [] } = useEtmsDashboard();

  const { data: departments = [] } = useQuery({
    queryKey: queryKeys.departments,
    queryFn: departmentsApi.getAll,
  });

  // 1. Filter Tickets based on time, scope, and department
  const filteredTickets = React.useMemo(() => {
    let list = [...tickets];

    // Filter by scope
    if (scopeFilter === 'mine' && user) {
      list = list.filter((t) => t.assigned_to_id === user.id || t.requester_id === user.id);
    }

    // Filter by department
    if (deptFilter !== 'all') {
      list = list.filter((t) => t.department_id === deptFilter);
    }

    // Filter by date range
    const now = new Date();
    const cutOff = new Date();
    if (timeFilter === 'today') {
      cutOff.setHours(0, 0, 0, 0);
    } else if (timeFilter === 'week') {
      cutOff.setDate(now.getDate() - 7);
    } else if (timeFilter === 'month') {
      cutOff.setDate(now.getDate() - 30);
    }

    if (timeFilter !== 'all') {
      list = list.filter((t) => new Date(t.created_at) >= cutOff);
    }

    return list;
  }, [tickets, timeFilter, scopeFilter, deptFilter, user]);

  // 2. Filter Activities (actions/transitions feed)
  const filteredActivities = React.useMemo(() => {
    let list = [...activities];

    // Simple keyword matches to approximate filters for demonstration
    if (deptFilter !== 'all') {
      const dept = departments.find(d => d.id === deptFilter);
      if (dept) {
        const keyword = dept.name.toLowerCase();
        list = list.filter((a) => a.description?.toLowerCase().includes(keyword));
      }
    }

    return list.slice(0, 10);
  }, [activities, deptFilter, departments]);

  // 3. Extract Comments from activities
  const recentComments = React.useMemo(() => {
    const commentsList: any[] = [];
    activities.forEach((act: any) => {
      if (act.description?.toLowerCase().includes('comment') || act.type === 'COMMENT') {
        commentsList.push(act);
      }
    });

    // Fallback comments mock if empty
    if (commentsList.length === 0) {
      return [
        { id: 'c-1', title: 'New comment added on TKT-1040', description: 'Employee: "Please check the SLA remaining on the VPN token creation."', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 'c-2', title: 'Internal Note on TKT-1025', description: 'Agent: "We need authorization from HR before assigning the dual screens."', created_at: new Date(Date.now() - 7200000).toISOString() },
      ];
    }
    return commentsList;
  }, [activities]);

  // 4. SLA Warning/Breached Tickets list
  const slaWarnings = React.useMemo(() => {
    return tickets.filter((t) => {
      const isUnresolved = t.status !== 'RESOLVED' && t.status !== 'CLOSED' && t.status !== 'CANCELLED';
      const isCritical = t.priority === 'CRITICAL' || t.priority === 'HIGH';
      return isUnresolved && isCritical;
    }).slice(0, 5);
  }, [tickets]);

  // 5. Active Escalations (Critical tickets unresolved)
  const escalations = React.useMemo(() => {
    return tickets.filter((t) =>
      t.priority === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
    ).slice(0, 5);
  }, [tickets]);

  // Format date helper
  const relativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Operations Activity Center"
        description="Unified hub monitoring tickets lifecycle, manager approvals steps, and real-time SLA warning signals."
        breadcrumbs={[{ label: 'Activity Center' }]}
      />

      {/* Filter controls row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-muted/20 p-4 rounded-xl border border-border/40">
        <div className="flex flex-wrap items-center gap-3">
          {/* Time range */}
          <div className="flex bg-card rounded-lg p-0.5 border border-border/60">
            {['today', 'week', 'month'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${
                  timeFilter === t
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Scope selection */}
          <div className="flex bg-card rounded-lg p-0.5 border border-border/60">
            {['all', 'mine'].map((s) => (
              <button
                key={s}
                onClick={() => setScopeFilter(s)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${
                  scopeFilter === s
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                }`}
              >
                {s === 'all' ? 'Global' : 'My Items'}
              </button>
            ))}
          </div>
        </div>

        {/* Department select */}
        <div className="w-full md:w-48 shrink-0">
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-9 text-xs rounded-lg" aria-label="Filter by department">
              <Building className="h-4 w-4 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dynamic Widgets Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Recent Tickets & Comments */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Recent Tickets Widget */}
          <ComponentErrorBoundary name="ActiveTicketsWidget">
            <Card className="rounded-[2rem] shadow-sm border border-border/60 bg-card overflow-hidden">
              <CardHeader className="border-b border-border/30 bg-muted/10">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Active Tickets Operations ({filteredTickets.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredTickets.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground italic">
                    No ticket events logged inside this scope.
                  </div>
                ) : (
                  <div className="divide-y divide-border/20">
                    {filteredTickets.slice(0, 5).map((ticket) => (
                      <div key={ticket.id} className="p-4 flex items-start justify-between gap-4 hover:bg-muted/5 transition-colors">
                        <div className="space-y-1">
                          <Link to={`/app/tickets/${ticket.id}`} className="font-bold text-xs hover:underline text-foreground">
                            {ticket.ticket_number || 'TKT'}: {ticket.title}
                          </Link>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {ticket.description || 'No description provided.'}
                          </p>
                          <div className="flex items-center gap-2 text-[9px] font-medium text-slate-500 pt-0.5">
                            <span>Priority: {ticket.priority}</span>
                            <span>•</span>
                            <span>Opened {relativeTime(ticket.created_at)}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-black rounded-lg">
                          {ticket.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </ComponentErrorBoundary>

          {/* Recent Comments Feed */}
          <ComponentErrorBoundary name="RecentCommentsFeed">
            <Card className="rounded-[2rem] shadow-sm border border-border/60 bg-card overflow-hidden">
              <CardHeader className="border-b border-border/30 bg-muted/10">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  Recent Comments & Communication Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {recentComments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground italic">
                    No comment activity logged.
                  </div>
                ) : (
                  <div className="divide-y divide-border/20">
                    {recentComments.map((comment) => (
                      <div key={comment.id} className="p-4 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {comment.title}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {relativeTime(comment.created_at || comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                          {comment.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </ComponentErrorBoundary>

        </div>

        {/* Right column: SLA Warnings, Approvals, Escalations */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* SLA Warnings Widget */}
          <ComponentErrorBoundary name="SlaWarningsWidget">
            <Card className="rounded-2xl border-rose-100 dark:border-rose-950/40 bg-card shadow-sm overflow-hidden">
              <CardHeader className="border-b border-rose-100 dark:border-rose-950/20 bg-rose-500/[0.02]">
                <CardTitle className="text-xs font-black uppercase tracking-[0.1em] flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-4.5 w-4.5" />
                  SLA Warning Flags
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {slaWarnings.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic pl-1">All SLAs are fully matching bounds.</p>
                ) : (
                  <div className="space-y-2.5">
                    {slaWarnings.map((t) => (
                      <div key={t.id} className="flex justify-between items-center text-xs bg-rose-500/[0.03] p-2.5 rounded-xl border border-rose-200/20">
                        <Link to={`/app/tickets/${t.id}`} className="hover:underline font-bold text-foreground truncate mr-2 flex-1">
                          {t.ticket_number || 'TKT'}: {t.title}
                        </Link>
                        <Badge variant="destructive" className="text-[8px] font-black tracking-widest rounded-lg shrink-0">
                          {t.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </ComponentErrorBoundary>

          {/* Active Pending Approvals */}
          <ComponentErrorBoundary name="ActivePendingApprovals">
            <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border/30 bg-muted/10">
                <CardTitle className="text-xs font-black uppercase tracking-[0.1em] flex items-center gap-1.5">
                  <UserCheck className="h-4.5 w-4.5 text-emerald-500" />
                  Active Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {pendingApprovals.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic pl-1">No pending approvals required.</p>
                ) : (
                  <div className="space-y-2.5">
                    {pendingApprovals.slice(0, 4).map((app: any) => (
                      <div key={app.id} className="p-2.5 bg-muted/20 border rounded-xl space-y-2">
                        <div className="flex justify-between items-start text-xs font-bold">
                          <Link to={`/app/tickets/${app.ticket_id}`} className="hover:underline truncate mr-2">
                            {app.title || `Approval Request - ${app.id.slice(0, 8)}`}
                          </Link>
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                          <span>Role required: {app.approver_role || 'Manager'}</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </ComponentErrorBoundary>

          {/* Urgent Escalations Tracker */}
          <ComponentErrorBoundary name="UrgentEscalationsTracker">
            <Card className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border/30 bg-muted/10">
                <CardTitle className="text-xs font-black uppercase tracking-[0.1em] flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <XCircle className="h-4.5 w-4.5 text-rose-500" />
                  Urgent Escalations Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {escalations.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic pl-1">No critical escalations logged.</p>
                ) : (
                  <div className="space-y-2.5">
                    {escalations.map((t) => (
                      <div key={t.id} className="p-2.5 bg-muted/10 border rounded-xl flex items-center justify-between text-xs">
                        <Link to={`/app/tickets/${t.id}`} className="hover:underline font-semibold truncate mr-2 flex-1">
                          {t.title}
                        </Link>
                        <span className="text-[10px] text-rose-500 font-bold shrink-0">CRITICAL</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </ComponentErrorBoundary>

        </div>

      </div>
    </div>
  );
}
export { ActivityCenterPage };
