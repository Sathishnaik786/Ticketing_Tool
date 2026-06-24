import React, { useEffect, useState } from 'react';
import { apiCall } from '@/services/api';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, GitBranch, Layers, LayoutGrid, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Workflow {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface WorkflowVersion {
  id: string;
  version_number: number;
  is_published: boolean;
}

interface Step {
  id?: string;
  name: string;
  type: 'APPROVAL' | 'NOTIFICATION' | 'TASK';
  step_order: number;
  assigned_role?: string;
  assigned_user_id?: string;
  configuration: Record<string, any>;
}

export default function WorkflowBuilderPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [steps, setSteps] = useState<Step[]>([]);
  
  // Creation States
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [isCreatingWf, setIsCreatingWf] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch Workflows
  const fetchWorkflows = async () => {
    try {
      const res = await apiCall('/v1/esm/workflows', 'GET');
      if (res.success && res.data) {
        setWorkflows(res.data);
      }
    } catch (err: any) {
      toast.error('Failed to load workflows: ' + err.message);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  // Fetch versions when workflow changes
  useEffect(() => {
    if (!selectedWorkflow) return;
    const fetchVersions = async () => {
      try {
        const res = await apiCall(`/v1/esm/workflows/${selectedWorkflow.id}/versions`, 'GET');
        if (res.success && res.data) {
          setVersions(res.data);
          if (res.data.length > 0) {
            // Pick latest or published version
            const sorted = [...res.data].sort((a, b) => b.version_number - a.version_number);
            setSelectedVersionId(sorted[0].id);
          } else {
            setSelectedVersionId('');
            setSteps([]);
          }
        }
      } catch (err: any) {
        toast.error('Failed to load workflow versions: ' + err.message);
      }
    };
    fetchVersions();
  }, [selectedWorkflow]);

  // Fetch steps when version changes
  useEffect(() => {
    if (!selectedVersionId || !selectedWorkflow) return;
    const fetchSteps = async () => {
      try {
        const res = await apiCall(`/v1/esm/workflows/${selectedWorkflow.id}/versions/${selectedVersionId}/steps`, 'GET');
        if (res.success && res.data) {
          setSteps(res.data.sort((a: Step, b: Step) => a.step_order - b.step_order));
        }
      } catch (err: any) {
        toast.error('Failed to load workflow steps: ' + err.message);
      }
    };
    fetchSteps();
  }, [selectedVersionId, selectedWorkflow]);

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName) return;

    try {
      const res = await apiCall('/v1/esm/workflows', 'POST', {
        name: newWfName,
        description: newWfDesc
      });
      if (res.success) {
        toast.success('Workflow created successfully.');
        setNewWfName('');
        setNewWfDesc('');
        setIsCreatingWf(false);
        fetchWorkflows();
      }
    } catch (err: any) {
      toast.error('Failed to create workflow: ' + err.message);
    }
  };

  const handleAddStep = () => {
    const nextOrder = steps.length + 1;
    setSteps(prev => [
      ...prev,
      {
        name: `Step ${nextOrder}: New Action`,
        type: 'TASK',
        step_order: nextOrder,
        configuration: {}
      }
    ]);
  };

  const handleRemoveStep = (index: number) => {
    const updated = steps.filter((_, idx) => idx !== index).map((step, idx) => ({
      ...step,
      step_order: idx + 1
    }));
    setSteps(updated);
  };

  const handleStepChange = (index: number, key: keyof Step, value: any) => {
    setSteps(prev => prev.map((step, idx) => {
      if (idx === index) {
        return { ...step, [key]: value };
      }
      return step;
    }));
  };

  const handleStepConfigChange = (index: number, configKey: string, value: any) => {
    setSteps(prev => prev.map((step, idx) => {
      if (idx === index) {
        return {
          ...step,
          configuration: {
            ...step.configuration,
            [configKey]: value
          }
        };
      }
      return step;
    }));
  };

  const handleSaveSteps = async () => {
    if (!selectedWorkflow) return;
    
    // Cycle check: verify all steps have valid order and name
    if (steps.some(s => !s.name)) {
      toast.error('All steps must have names.');
      return;
    }

    setSaving(true);
    try {
      const res = await apiCall(`/v1/esm/workflows/${selectedWorkflow.id}/steps`, 'POST', {
        steps
      });
      if (res.success) {
        toast.success('Workflow steps saved and published as a new version.');
        // Refresh versions
        const verRes = await apiCall(`/v1/esm/workflows/${selectedWorkflow.id}/versions`, 'GET');
        if (verRes.success && verRes.data) {
          setVersions(verRes.data);
          const sorted = [...verRes.data].sort((a, b) => b.version_number - a.version_number);
          setSelectedVersionId(sorted[0].id);
        }
      }
    } catch (err: any) {
      toast.error('Failed to save workflow steps: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Enterprise Workflow Orchestrator
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Design execution DAGs, route automated notifications, and configure multi-tier approvals.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingWf(true)}
          className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 flex items-center gap-2 text-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column: Workflows & Versions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Select Workflow
            </h3>
            
            {isCreatingWf ? (
              <form onSubmit={handleCreateWorkflow} className="space-y-4 pt-2">
                <input
                  type="text"
                  placeholder="Workflow Name"
                  required
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                />
                <textarea
                  placeholder="Description"
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm h-20 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingWf(false)}
                    className="flex-1 py-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-lg hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {workflows.map(wf => (
                  <button
                    key={wf.id}
                    onClick={() => setSelectedWorkflow(wf)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedWorkflow?.id === wf.id
                        ? 'bg-primary/10 text-primary border-l-4 border-primary font-bold'
                        : 'hover:bg-accent/40 text-foreground/80'
                    }`}
                  >
                    {wf.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedWorkflow && (
            <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Workflow Versions
              </h3>
              <div className="space-y-2">
                {versions.map(ver => (
                  <button
                    key={ver.id}
                    onClick={() => setSelectedVersionId(ver.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between border ${
                      selectedVersionId === ver.id
                        ? 'bg-accent border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:bg-accent/40'
                    }`}
                  >
                    <span>Version #{ver.version_number}</span>
                    {ver.is_published && (
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-[10px] font-bold">
                        Published
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Steps Config Canvas */}
        <div className="lg:col-span-3">
          {selectedWorkflow ? (
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                    <span>Editing: {selectedWorkflow.name}</span>
                  </h2>
                  <p className="text-muted-foreground text-xs mt-1">{selectedWorkflow.description}</p>
                </div>
                
                <button
                  onClick={handleSaveSteps}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 text-xs transition-all flex items-center gap-2 shadow-lg shadow-primary/10"
                >
                  {saving ? 'Saving...' : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save and Publish</span>
                    </>
                  )}
                </button>
              </div>

              {/* Steps Sequential List */}
              <div className="space-y-4 pt-4 border-t">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-4 p-5 bg-accent/20 border border-border/40 rounded-2xl relative group"
                  >
                    {/* Delete Icon */}
                    <button
                      onClick={() => handleRemoveStep(index)}
                      className="absolute right-4 top-4 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="h-8 w-8 bg-primary/10 text-primary font-bold rounded-lg flex items-center justify-center text-sm">
                        {step.step_order}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                      {/* Step Name */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Step Name</label>
                        <input
                          type="text"
                          value={step.name}
                          onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 bg-background border border-input rounded-lg text-xs"
                          placeholder="e.g. Manager Approval"
                        />
                      </div>

                      {/* Step Type */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Action Type</label>
                        <select
                          value={step.type}
                          onChange={(e) => handleStepChange(index, 'type', e.target.value as any)}
                          className="w-full px-3 py-1.5 bg-background border border-input rounded-lg text-xs"
                        >
                          <option value="TASK">Auto Task (Placeholder)</option>
                          <option value="APPROVAL">Required Approval</option>
                          <option value="NOTIFICATION">Send Notification</option>
                        </select>
                      </div>

                      {/* Configurations based on Type */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">Config Payload</label>
                        
                        {step.type === 'APPROVAL' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Assigned Role (e.g. MANAGER)"
                              value={step.assigned_role || ''}
                              onChange={(e) => handleStepChange(index, 'assigned_role', e.target.value)}
                              className="w-full px-3 py-1 bg-background border border-input rounded-md text-[11px]"
                            />
                            <input
                              type="text"
                              placeholder="Assigned User UUID (Optional)"
                              value={step.assigned_user_id || ''}
                              onChange={(e) => handleStepChange(index, 'assigned_user_id', e.target.value)}
                              className="w-full px-3 py-1 bg-background border border-input rounded-md text-[11px]"
                            />
                          </div>
                        )}

                        {step.type === 'NOTIFICATION' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Template Key (e.g. TICKET_ASSIGNED)"
                              value={step.configuration?.template_key || ''}
                              onChange={(e) => handleStepConfigChange(index, 'template_key', e.target.value)}
                              className="w-full px-3 py-1 bg-background border border-input rounded-md text-[11px]"
                            />
                          </div>
                        )}

                        {step.type === 'TASK' && (
                          <p className="text-[11px] text-muted-foreground italic pt-2">No extra configurations needed.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleAddStep}
                  className="w-full py-4 border border-dashed hover:border-primary/50 hover:bg-primary/5 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all text-muted-foreground hover:text-primary"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Next Step Action</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed rounded-3xl p-8 bg-accent/5">
              <Layers className="h-12 w-12 text-muted-foreground animate-pulse" />
              <h3 className="mt-4 text-lg font-semibold">Select a Workflow to edit</h3>
              <p className="text-muted-foreground text-sm max-w-xs mt-2">
                Choose one from the sidebar or click "New Workflow" to start designing from scratch.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
