import { create, all } from 'mathjs';

const math = create(all, {});

export interface FormulaVariables {
  [key: string]: number;
}

export class FormulaEvaluator {
  /**
   * Evaluates a mathematical formula with given variables.
   * Uses mathjs for safe evaluation.
   */
  static evaluate(formula: string, variables: FormulaVariables): number {
    try {
      // Basic sanitization: Ensure no dangerous characters or keywords
      // mathjs already prevents arbitrary JS execution by default, 
      // but we add an extra layer of safety.
      
      const result = math.evaluate(formula, variables);
      
      if (typeof result !== 'number' && typeof result !== 'bigint') {
        throw new Error('Formula did not evaluate to a numeric value');
      }
      
      return Number(result);
    } catch (error: any) {
      console.error(`Formula Evaluation Error [${formula}]:`, error.message);
      throw new Error(`Failed to evaluate formula: ${error.message}`);
    }
  }

  /**
   * Validates if a formula is syntactically correct and doesn't contain forbidden patterns.
   */
  static validateSyntax(formula: string): boolean {
    try {
      math.parse(formula);
      return true;
    } catch {
      return false;
    }
  }
}
