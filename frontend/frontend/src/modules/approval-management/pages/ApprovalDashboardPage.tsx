import { PageHeader } from '@/components/layout/PageHeader';
import { PendingApprovalsWidget } from '../components/PendingApprovalsWidget';
import { useServiceCatalog } from '../hooks/useApprovalManagement';
import { DataTableSkeleton } from '@/components/common/Skeletons';

export default function ApprovalDashboardPage() {
  const { data: catalogs, isLoading } = useServiceCatalog();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Approval Dashboard"
        description="Service catalog and pending approval overview for Aparna Enterprises ETMS."
        className="enterprise-panel mb-0"
      />

      <PendingApprovalsWidget />

      <section className="enterprise-panel space-y-4">
        <h2 className="text-lg font-semibold">Service Catalog</h2>
        {isLoading ? (
          <DataTableSkeleton />
        ) : !catalogs?.length ? (
          <p className="text-sm text-muted-foreground">No service catalogs configured.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {catalogs.map((catalog) => (
              <article key={catalog.id} className="rounded-lg border p-4 space-y-3">
                <div>
                  <h3 className="font-medium">{catalog.name}</h3>
                  <p className="text-xs text-muted-foreground">{catalog.category}</p>
                </div>
                <ul className="space-y-2">
                  {catalog.items.map((item) => (
                    <li key={item.id} className="text-sm flex justify-between gap-2">
                      <span>{item.name}</span>
                      {item.requires_approval && (
                        <span className="text-xs text-muted-foreground">Requires approval</span>
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
