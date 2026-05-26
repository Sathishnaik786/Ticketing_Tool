import { FormulaEvaluator } from './formula-evaluator';
import { DependencyResolver } from './dependency-resolver';

export class FormulaValidator {
  static validate(formula: string): { isValid: boolean; error?: string } {
    if (!formula || formula.trim() === '') {
      return { isValid: false, error: 'Formula cannot be empty' };
    }

    if (!FormulaEvaluator.validateSyntax(formula)) {
      return { isValid: false, error: 'Invalid mathematical syntax' };
    }

    // Check for potential dangerous patterns
    const dangerousPatterns = ['document.', 'window.', 'eval', 'function', '=>'];
    for (const pattern of dangerousPatterns) {
      if (formula.includes(pattern)) {
        return { isValid: false, error: `Formula contains forbidden pattern: ${pattern}` };
      }
    }

    return { isValid: true };
  }
}
