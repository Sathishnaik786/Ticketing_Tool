import React, { useEffect, useState } from 'react';
import { apiCall } from '@/services/api';
import { Loader2, Save, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface SystemSetting {
  key: string;
  value: string;
  description: string;
  category: string;
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await apiCall('/v1/esm/settings', 'GET');
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      toast.error('Failed to load system settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleStartEdit = (setting: SystemSetting) => {
    setEditingKey(setting.key);
    setEditValue(setting.value);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const handleSave = async (key: string) => {
    setSavingKey(key);
    try {
      const res = await apiCall(`/v1/esm/settings/${key}`, 'PUT', {
        value: editValue
      });

      if (res.success) {
        toast.success(`System setting '${key}' updated successfully.`);
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value: editValue } : s));
        setEditingKey(null);
      } else {
        toast.error(res.message || 'Failed to update setting');
      }
    } catch (err: any) {
      toast.error('Update failed: ' + err.message);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 min-h-screen">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          System Registry Settings
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Configure runtime engine behaviors, cache rules, notification limits, and audit logs.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-muted-foreground text-sm font-medium">Fetching settings registry...</span>
        </div>
      ) : settings.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-3xl bg-accent/5 max-w-xl mx-auto">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto animate-spin" />
          <h3 className="mt-4 text-lg font-semibold">No settings registered</h3>
          <p className="text-muted-foreground text-sm mt-2">
            The system settings registry appears to be empty.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/40 text-xs font-bold text-muted-foreground uppercase border-b">
                  <th className="px-6 py-4">Setting Key</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Runtime Value</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm">
                {settings.map((setting) => {
                  const isEditing = setting.key === editingKey;
                  const isSaving = setting.key === savingKey;

                  return (
                    <tr key={setting.key} className="hover:bg-accent/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-foreground">
                        {setting.key}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-[10px] font-bold">
                          {setting.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-3 py-1.5 bg-background border border-input rounded-lg text-xs w-full max-w-[150px] focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        ) : (
                          <span className="font-semibold bg-accent px-2 py-1 rounded text-xs">
                            {setting.value}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs max-w-xs">
                        {setting.description}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSave(setting.key)}
                              disabled={isSaving}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                              <span>Save</span>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(setting)}
                            className="px-3 py-1.5 border hover:bg-accent/40 text-xs font-semibold rounded-lg transition-all"
                          >
                            Edit Value
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
