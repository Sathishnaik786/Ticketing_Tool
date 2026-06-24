import type { NotificationAnalytics } from '../services/notificationCenterService';

export function NotificationAnalyticsWidgets({ analytics }: { analytics?: NotificationAnalytics }) {
  if (!analytics) return null;

  const cards = [
    { label: 'Total Notifications', value: analytics.total },
    { label: 'Unread', value: analytics.unread },
    { label: 'Read %', value: `${analytics.readPct}%` },
    { label: 'Delivery %', value: `${analytics.deliveryPct}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="enterprise-panel p-4">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="text-2xl font-semibold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="enterprise-panel p-4">
          <h3 className="font-medium text-sm mb-3">By Module</h3>
          <ul className="space-y-2 text-sm">
            {analytics.byModule.map((m) => (
              <li key={m.module} className="flex justify-between">
                <span>{m.module}</span>
                <span>{m.count}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="enterprise-panel p-4">
          <h3 className="font-medium text-sm mb-3">By Priority</h3>
          <ul className="space-y-2 text-sm">
            {analytics.byPriority.map((p) => (
              <li key={p.priority} className="flex justify-between">
                <span>{p.priority}</span>
                <span>{p.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
