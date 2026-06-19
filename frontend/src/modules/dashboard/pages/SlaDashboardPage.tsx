import { PageHeader } from '@/components/layout/PageHeader';
import { ShieldCheck } from 'lucide-react';

export default function SlaDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="SLA Dashboard"
        description="Monitor SLA compliance, breaches, and at-risk tickets across departments."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'SLA Compliance', value: '94.2%' },
          { label: 'Active Breaches', value: '7' },
          { label: 'At-Risk Tickets', value: '12' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
          >
            <ShieldCheck className="h-5 w-5 text-emerald-600 mb-3" aria-hidden />
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-slate-500">
        Detailed SLA analytics will connect to ticketing SLA endpoints in a follow-up release.
      </p>
    </div>
  );
}
