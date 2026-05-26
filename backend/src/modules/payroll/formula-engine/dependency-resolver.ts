export interface ComponentWithFormula {
  code: string;
  formula?: string | null;
  calculation_type: string;
}

export class DependencyResolver {
  /**
   * Extracts variables from a mathjs-compatible formula.
   */
  static extractVariables(formula: string): string[] {
    // Simple regex to find words that aren't functions or constants
    // A better way is using math.parse(formula).filter(...) but regex is faster for simple extraction
    const matches = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    const forbidden = ['sin', 'cos', 'tan', 'exp', 'sqrt', 'pow', 'abs', 'log', 'CTC', 'gross', 'net', 'basic'];
    return [...new Set(matches)].filter(m => !forbidden.includes(m));
  }

  /**
   * Sorts components based on their dependencies using topological sort.
   * Also detects circular dependencies.
   */
  static resolveOrder(components: ComponentWithFormula[]): ComponentWithFormula[] {
    const adj = new Map<string, string[]>();
    const componentMap = new Map<string, ComponentWithFormula>();

    components.forEach(c => {
      componentMap.set(c.code, c);
      if (c.calculation_type === 'FORMULA' && c.formula) {
        adj.set(c.code, this.extractVariables(c.formula));
      } else {
        adj.set(c.code, []);
      }
    });

    const visited = new Set<string>();
    const recStack = new Set<string>();
    const result: ComponentWithFormula[] = [];

    const visit = (code: string) => {
      if (recStack.has(code)) {
        throw new Error(`Circular dependency detected: ${code}`);
      }
      if (visited.has(code)) return;

      recStack.add(code);
      const deps = adj.get(code) || [];
      deps.forEach(dep => {
        if (componentMap.has(dep)) {
          visit(dep);
        }
      });

      recStack.delete(code);
      visited.add(code);
      result.push(componentMap.get(code)!);
    };

    components.forEach(c => visit(c.code));

    return result;
  }
}
