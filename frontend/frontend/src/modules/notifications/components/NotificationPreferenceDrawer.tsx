import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Bell, Mail, MessageSquare, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface NotificationPreferences {
  in_app: boolean;
  email: boolean;
  slack: boolean;
  categories: {
    tickets: boolean;
    approvals: boolean;
    system: boolean;
    announcements: boolean;
  };
}

export interface NotificationPreferenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preferences?: NotificationPreferences;
  onSave: (prefs: NotificationPreferences) => void;
  isSaving?: boolean;
}

const defaultPreferences: NotificationPreferences = {
  in_app: true,
  email: true,
  slack: false,
  categories: {
    tickets: true,
    approvals: true,
    system: true,
    announcements: true,
  },
};

export function NotificationPreferenceDrawer({
  isOpen,
  onClose,
  preferences,
  onSave,
  isSaving = false,
}: NotificationPreferenceDrawerProps) {
  const [localPrefs, setLocalPrefs] = React.useState<NotificationPreferences>(defaultPreferences);

  React.useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleChannelToggle = (channel: 'in_app' | 'email' | 'slack') => {
    setLocalPrefs((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const handleCategoryToggle = (category: keyof NotificationPreferences['categories']) => {
    setLocalPrefs((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localPrefs);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-card border-l border-border flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 id="drawer-title" className="text-base font-bold text-slate-900 dark:text-white">
                    Preferences Configuration
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage notification alert channels and system routing.
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                  <X className="h-4.5 w-4.5" />
                </Button>
              </div>

              {/* Preferences Form content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Alert Channels Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    Alert Channels
                  </h3>
                  <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <Label htmlFor="in-app-notifs" className="text-xs font-bold">In-App Banner Notifications</Label>
                          <p className="text-[10px] text-muted-foreground">Alert popups in the web header bell.</p>
                        </div>
                      </div>
                      <Switch
                        id="in-app-notifs"
                        checked={localPrefs.in_app}
                        onCheckedChange={() => handleChannelToggle('in_app')}
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-border/20 pt-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div>
                          <Label htmlFor="email-notifs" className="text-xs font-bold">Digest Emails</Label>
                          <p className="text-[10px] text-muted-foreground">Deliver summary logs to user inbox.</p>
                        </div>
                      </div>
                      <Switch
                        id="email-notifs"
                        checked={localPrefs.email}
                        onCheckedChange={() => handleChannelToggle('email')}
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-border/20 pt-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <Label htmlFor="slack-notifs" className="text-xs font-bold">Webhook Connect (Slack / Teams)</Label>
                          <p className="text-[10px] text-muted-foreground">Forward system notifications to Slack integrations.</p>
                        </div>
                      </div>
                      <Switch
                        id="slack-notifs"
                        checked={localPrefs.slack}
                        onCheckedChange={() => handleChannelToggle('slack')}
                      />
                    </div>
                  </div>
                </div>

                {/* Subscribed Operations Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Subscribed Operations
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Label htmlFor="cat-tickets" className="text-xs font-bold">Ticketing Updates</Label>
                        <p className="text-[10px] text-muted-foreground">Alerts on assignee, priorities, or comments.</p>
                      </div>
                      <Switch
                        id="cat-tickets"
                        checked={localPrefs.categories.tickets}
                        onCheckedChange={() => handleCategoryToggle('tickets')}
                      />
                    </div>

                    <div className="flex items-start justify-between border-t border-border/20 pt-3">
                      <div>
                        <Label htmlFor="cat-approvals" className="text-xs font-bold">Approvals Actions</Label>
                        <p className="text-[10px] text-muted-foreground">Requests for managers or assignment changes.</p>
                      </div>
                      <Switch
                        id="cat-approvals"
                        checked={localPrefs.categories.approvals}
                        onCheckedChange={() => handleCategoryToggle('approvals')}
                      />
                    </div>

                    <div className="flex items-start justify-between border-t border-border/20 pt-3">
                      <div>
                        <Label htmlFor="cat-system" className="text-xs font-bold">System Alerts</Label>
                        <p className="text-[10px] text-muted-foreground">SLA countdown warning states or compliance triggers.</p>
                      </div>
                      <Switch
                        id="cat-system"
                        checked={localPrefs.categories.system}
                        onCheckedChange={() => handleCategoryToggle('system')}
                      />
                    </div>

                    <div className="flex items-start justify-between border-t border-border/20 pt-3">
                      <div>
                        <Label htmlFor="cat-announcements" className="text-xs font-bold">Broadcasting Bulletins</Label>
                        <p className="text-[10px] text-muted-foreground">Pinned organizational announcements feed.</p>
                      </div>
                      <Switch
                        id="cat-announcements"
                        checked={localPrefs.categories.announcements}
                        onCheckedChange={() => handleCategoryToggle('announcements')}
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Form Footer */}
              <div className="p-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={onClose} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg shadow-primary/10"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default NotificationPreferenceDrawer;
