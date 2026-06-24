interface DepartmentScorecardProps {
  scorecards: Array<{
    departmentId: string;
    departmentName: string;
    ticketVolume: number;
    metrics: {
      slaCompliancePct: number;
      csatScore: number;
      escalations: number;
      resolutionTimeHours: number;
    };
  }>;
}

export function DepartmentScorecard({ scorecards }: DepartmentScorecardProps) {
  if (!scorecards.length) {
    return <p className="text-sm text-muted-foreground">No department data available.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {scorecards.map((dept) => (
        <article key={dept.departmentId} className="rounded-lg border p-4 space-y-2">
          <h3 className="font-semibold">{dept.departmentName}</h3>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-muted-foreground">Volume</dt><dd className="font-medium">{dept.ticketVolume}</dd></div>
            <div><dt className="text-muted-foreground">SLA %</dt><dd className="font-medium">{dept.metrics.slaCompliancePct}%</dd></div>
            <div><dt className="text-muted-foreground">CSAT</dt><dd className="font-medium">{dept.metrics.csatScore}</dd></div>
            <div><dt className="text-muted-foreground">Escalations</dt><dd className="font-medium">{dept.metrics.escalations}</dd></div>
          </dl>
        </article>
      ))}
    </div>
  );
}
