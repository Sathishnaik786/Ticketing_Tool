import { FormulaEvaluator, FormulaVariables } from './formula-evaluator';
import { DependencyResolver } from './dependency-resolver';

export class FormulaParser {
  static parseAndEvaluate(formula: string, variables: FormulaVariables): number {
    return FormulaEvaluator.evaluate(formula, variables);
  }

  static getDependencies(formula: string): string[] {
    return DependencyResolver.extractVariables(formula);
  }
}
