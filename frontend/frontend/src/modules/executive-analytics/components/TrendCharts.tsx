interface TrendChartsProps {
  monthly: Array<{ month: string; created: number; closed: number }>;
}

export function TrendCharts({ monthly }: TrendChartsProps) {
  if (!monthly.length) {
    return <p className="text-sm text-muted-foreground">No trend data available.</p>;
  }

  const max = Math.max(...monthly.flatMap((m) => [m.created, m.closed]), 1);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Ticket Volume Trends</h3>
      <ul className="space-y-3">
        {monthly.map((row) => (
          <li key={row.month} className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{row.month}</span>
              <span>Created {row.created} · Closed {row.closed}</span>
            </div>
            <div className="h-2 rounded bg-muted overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: `${(row.created / max) * 100}%` }} />
              <div className="bg-primary/40 h-full" style={{ width: `${(row.closed / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
