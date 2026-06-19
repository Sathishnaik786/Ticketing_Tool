interface BusinessUnitScorecardProps {
  scorecards: Array<{
    businessUnit: string;
    ticketCount: number;
    slaCompliancePct: number;
    csatScore: number;
    approvalTurnaroundHours: number;
    resolutionTrend: number;
  }>;
}

export function BusinessUnitScorecard({ scorecards }: BusinessUnitScorecardProps) {
  if (!scorecards.length) {
    return <p className="text-sm text-muted-foreground">No business unit data available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2 pr-4">Business Unit</th>
            <th className="py-2 pr-4">Tickets</th>
            <th className="py-2 pr-4">SLA %</th>
            <th className="py-2 pr-4">CSAT</th>
            <th className="py-2 pr-4">Approvals (hrs)</th>
            <th className="py-2">Resolution %</th>
          </tr>
        </thead>
        <tbody>
          {scorecards.map((bu) => (
            <tr key={bu.businessUnit} className="border-b">
              <td className="py-2 pr-4 font-medium">{bu.businessUnit}</td>
              <td className="py-2 pr-4">{bu.ticketCount}</td>
              <td className="py-2 pr-4">{bu.slaCompliancePct}%</td>
              <td className="py-2 pr-4">{bu.csatScore}</td>
              <td className="py-2 pr-4">{bu.approvalTurnaroundHours}</td>
              <td className="py-2">{bu.resolutionTrend}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
