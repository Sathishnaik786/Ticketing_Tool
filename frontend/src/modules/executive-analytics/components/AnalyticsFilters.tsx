interface AnalyticsFiltersProps {
  onExport?: (format: 'CSV' | 'XLSX' | 'PDF' | 'JSON') => void;
  isExporting?: boolean;
}

export function AnalyticsFilters({ onExport, isExporting }: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground mr-2">Export:</span>
      {(['CSV', 'XLSX', 'PDF', 'JSON'] as const).map((format) => (
        <button
          key={format}
          type="button"
          className="text-xs border rounded px-2 py-1 hover:bg-muted disabled:opacity-50"
          disabled={isExporting}
          onClick={() => onExport?.(format)}
        >
          {format}
        </button>
      ))}
    </div>
  );
}

export function ExportToolbar({ onExport, isExporting }: AnalyticsFiltersProps) {
  return (
    <section className="enterprise-panel">
      <AnalyticsFilters onExport={onExport} isExporting={isExporting} />
    </section>
  );
}
