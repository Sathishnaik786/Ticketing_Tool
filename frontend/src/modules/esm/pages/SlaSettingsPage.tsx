import React, { useEffect, useState } from 'react';
import { apiCall } from '@/services/api';
import { AlertTriangle, Bell, Clock, List, Plus, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface EscalationRule {
  id: string;
  trigger_event: 'NEAR_BREACH' | 'BREACHED';
  buffer_percentage: number;
  action_type: 'NOTIFY_MANAGER' | 'REASSIGN_TICKET' | 'ESCALATE_PRIORITY';
}

interface SlaPolicy {
  id: string;
  name: string;
  description: string;
  priority: string;
  response_target_mins: number;
  resolution_target_mins: number;
  is_active: boolean;
  sla_escalation_rules?: EscalationRule[];
}

interface SlaBreach {
  id: string;
  ticket_id: string;
  breach_type: 'RESPONSE' | 'RESOLUTION';
  target_time: string;
  breached_at: string | null;
  is_acknowledged: boolean;
  sla_policies?: { name: string };
}

export default function SlaSettingsPage() {
  const [activeTab, setActiveTab] = useState<'policies' | 'breaches'>('policies');
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [breaches, setBreaches] = useState<SlaBreach[]>([]);
  const [loading, setLoading] = useState(true);

  // SLA Creation Form States
  const [isCreating, setIsCreating] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    priority: 'MEDIUM',
    response_target_mins: 60,
    resolution_target_mins: 240,
    rules: [
      { trigger_event: 'BREACHED', buffer_percentage: 100, action_type: 'NOTIFY_MANAGER' }
    ]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'policies') {
        const res = await apiCall('/v1/esm/sla', 'GET');
        if (res.success && res.data) {
          setPolicies(res.data);
        }
      } else {
        const res = await apiCall('/v1/esm/sla/breaches', 'GET');
        if (res.success && res.data) {
          setBreaches(res.data);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load SLA details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAcknowledge = async (breachId: string) => {
    try {
      const res = await apiCall(`/v1/esm/sla/breaches/${breachId}/acknowledge`, 'POST');
      if (res.success) {
        toast.success('Breach successfully acknowledged.');
        setBreaches(prev => prev.map(b => b.id === breachId ? { ...b, is_acknowledged: true } : b));
      }
    } catch (err: any) {
      toast.error('Failed to acknowledge breach: ' + err.message);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiCall('/v1/esm/sla', 'POST', newPolicy);
      if (res.success) {
        toast.success('SLA Policy created successfully.');
        setIsCreating(false);
        setNewPolicy({
          name: '',
          description: '',
          priority: 'MEDIUM',
          response_target_mins: 60,
          resolution_target_mins: 240,
          rules: [{ trigger_event: 'BREACHED', buffer_percentage: 100, action_type: 'NOTIFY_MANAGER' }]
        });
        fetchData();
      }
    } catch (err: any) {
      toast.error('Failed to create SLA Policy: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            SLA targets & Breach Monitor
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Establish response/resolution agreements and monitor active escalation flows.
          </p>
        </div>

        {activeTab === 'policies' && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 flex items-center gap-2 text-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Policy</span>
          </button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'policies'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <List className="h-4 w-4" />
          <span>SLA Policies</span>
        </button>
        <button
          onClick={() => setActiveTab('breaches')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'breaches'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Breach Monitor Log</span>
        </button>
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreatePolicy} className="bg-card border rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <h3 className="text-lg font-bold">New SLA Policy Definition</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bronze Priority Support"
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  placeholder="Policy scope..."
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Priority Tier</label>
                  <select
                    value={newPolicy.priority}
                    onChange={(e) => setNewPolicy(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-2 py-2 bg-background border border-input rounded-lg text-sm"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Response (Mins)</label>
                  <input
                    type="number"
                    value={newPolicy.response_target_mins}
                    onChange={(e) => setNewPolicy(prev => ({ ...prev, response_target_mins: parseInt(e.target.value, 10) }))}
                    className="w-full px-2 py-2 bg-background border border-input rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Resolution (Mins)</label>
                  <input
                    type="number"
                    value={newPolicy.resolution_target_mins}
                    onChange={(e) => setNewPolicy(prev => ({ ...prev, resolution_target_mins: parseInt(e.target.value, 10) }))}
                    className="w-full px-2 py-2 bg-background border border-input rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t">
              <button
                type="submit"
                className="flex-1 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90"
              >
                Create Policy
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="h-60 bg-accent/10 animate-pulse rounded-3xl" />
      ) : activeTab === 'policies' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map(policy => (
            <div key={policy.id} className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground">{policy.name}</h3>
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                  {policy.priority}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">{policy.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-medium border-t border-b py-3 border-border/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Response Target: <b>{policy.response_target_mins} mins</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span>Resolution Target: <b>{policy.resolution_target_mins} mins</b></span>
                </div>
              </div>

              {/* Escalation Rules list */}
              {policy.sla_escalation_rules && policy.sla_escalation_rules.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5" />
                    <span>Escalation Rules</span>
                  </div>
                  <div className="space-y-1.5">
                    {policy.sla_escalation_rules.map(rule => (
                      <div key={rule.id} className="text-xs bg-accent/40 px-3 py-1.5 border border-border/40 rounded-lg flex justify-between items-center">
                        <span>Trigger Event: <b>{rule.trigger_event}</b> ({rule.buffer_percentage}% buffer)</span>
                        <span className="font-bold text-primary">{rule.action_type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {breaches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-3xl p-8 bg-accent/5">
              <ShieldCheck className="h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-semibold">No breaches recorded</h3>
              <p className="text-muted-foreground text-sm max-w-xs mt-2">
                Your service teams are within limits. No target SLA violations detected.
              </p>
            </div>
          ) : (
            breaches.map(breach => (
              <div
                key={breach.id}
                className={`bg-card border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                  breach.is_acknowledged ? 'border-border/50 opacity-75' : 'border-red-500/20 bg-red-500/5'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={`h-4 w-4 ${breach.is_acknowledged ? 'text-muted-foreground' : 'text-red-500 animate-pulse'}`} />
                    <span className="text-sm font-bold">{breach.sla_policies?.name || 'SLA Target'} Breach</span>
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[10px] font-bold">
                      {breach.breach_type}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ticket ID: <span className="font-mono">{breach.ticket_id}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-4">
                    <span>Target Time: {new Date(breach.target_time).toLocaleString()}</span>
                    {breach.breached_at && (
                      <span className="text-red-500">Breached At: {new Date(breach.breached_at).toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {!breach.is_acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(breach.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-red-600/10 shrink-0"
                  >
                    Acknowledge Breach
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
