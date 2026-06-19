import type { NotificationPreferences } from '../services/notificationCenterService';

interface NotificationPreferencesFormProps {
  preferences?: NotificationPreferences;
  onSave: (prefs: Partial<NotificationPreferences>) => void;
  isSaving?: boolean;
}

export function NotificationPreferencesForm({ preferences, onSave, isSaving }: NotificationPreferencesFormProps) {
  if (!preferences) return null;

  const toggle = (key: keyof NotificationPreferences) => {
    onSave({ [key]: !preferences[key] });
  };

  return (
    <section className="enterprise-panel p-4 space-y-3">
      <h3 className="font-medium text-sm">Notification Preferences</h3>
      {(['in_app_enabled', 'email_enabled', 'sms_enabled', 'push_enabled'] as const).map((key) => (
        <label key={key} className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!preferences[key]} onChange={() => toggle(key)} disabled={isSaving} />
          {key.replace(/_/g, ' ')}
        </label>
      ))}
    </section>
  );
}
