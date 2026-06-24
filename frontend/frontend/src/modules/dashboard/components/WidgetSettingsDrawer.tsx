import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export interface WidgetSettings {
  limit: number;
  refreshRate: number;
  showAnalytics: boolean;
}

export interface WidgetSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  widgetName: string;
  settings: WidgetSettings;
  onSaveSettings: (settings: WidgetSettings) => void;
}

export function WidgetSettingsDrawer({
  isOpen,
  onClose,
  widgetName,
  settings,
  onSaveSettings,
}: WidgetSettingsDrawerProps) {
  const [localSettings, setLocalSettings] = React.useState<WidgetSettings>({
    limit: 5,
    refreshRate: 30,
    showAnalytics: true,
  });

  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />

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
                  <h2 id="settings-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Settings className="h-4.5 w-4.5 text-primary" />
                    Configure Widget: {widgetName}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fine-tune specific data refresh boundaries and layouts.
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                  <X className="h-4.5 w-4.5" />
                </Button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  {/* Limit input */}
                  <div className="space-y-2">
                    <Label htmlFor="limit-items" className="text-xs font-bold">Max Row Items Limit</Label>
                    <Input
                      type="number"
                      id="limit-items"
                      value={localSettings.limit}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, limit: parseInt(e.target.value) || 5 }))}
                      min={1}
                      max={20}
                      className="h-9 text-xs rounded-lg"
                    />
                    <p className="text-[10px] text-muted-foreground">Adjust maximum records count rendered on screen.</p>
                  </div>

                  {/* Refresh rate */}
                  <div className="space-y-2">
                    <Label htmlFor="refresh-rate" className="text-xs font-bold">Auto Refresh Interval (Seconds)</Label>
                    <Input
                      type="number"
                      id="refresh-rate"
                      value={localSettings.refreshRate}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, refreshRate: parseInt(e.target.value) || 30 }))}
                      min={5}
                      max={300}
                      className="h-9 text-xs rounded-lg"
                    />
                    <p className="text-[10px] text-muted-foreground">Adjust operational fetch telemetry syncing gaps.</p>
                  </div>

                  {/* Toggle charts */}
                  <div className="flex items-center justify-between border-t border-border/20 pt-4">
                    <div>
                      <Label htmlFor="show-charts" className="text-xs font-bold">Render Embedded Visual Analytics</Label>
                      <p className="text-[10px] text-muted-foreground">Toggles secondary sparkline visualization trends.</p>
                    </div>
                    <Switch
                      id="show-charts"
                      checked={localSettings.showAnalytics}
                      onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, showAnalytics: checked }))}
                    />
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="p-6 border-t border-border bg-muted/10 flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" onClick={handleSave} className="rounded-xl bg-primary hover:bg-primary/95 text-white">
                  <Save className="h-4 w-4 mr-1.5" />
                  Save Settings
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default WidgetSettingsDrawer;
