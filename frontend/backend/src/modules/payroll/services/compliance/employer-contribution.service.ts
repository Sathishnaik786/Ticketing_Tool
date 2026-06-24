import { PFEngineService } from './pf-engine.service';
import { ESIEngineService } from './esi-engine.service';

export class EmployerContributionService {
  /**
   * Aggregates all employer-side contributions.
   */
  static async calculateAll(employeeId: string, variables: any, grossSalary: number) {
    const pf = await PFEngineService.calculate(employeeId, variables);
    const esi = await ESIEngineService.calculate(employeeId, grossSalary);

    return [
      {
        type: 'PF_EMPLOYER',
        amount: pf.employer_amount,
        rule_snapshot: pf.rule_snapshot
      },
      {
        type: 'ESI_EMPLOYER',
        amount: esi.employer_amount,
        rule_snapshot: esi.rule_snapshot
      }
    ];
  }
}
