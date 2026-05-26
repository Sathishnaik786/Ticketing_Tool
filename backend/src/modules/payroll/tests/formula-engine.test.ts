import { FormulaEvaluator } from '../formula-engine/formula-evaluator';
import { DependencyResolver } from '../formula-engine/dependency-resolver';

export const runPayrollTests = () => {
  console.log('--- Starting Payroll Formula Engine Tests ---');

  // Test 1: Simple evaluation
  try {
    const basic = FormulaEvaluator.evaluate('CTC * 0.4', { CTC: 50000 });
    console.log('Test 1 (Simple Eval):', basic === 20000 ? 'PASSED' : 'FAILED', `(${basic})`);
  } catch (e: any) {
    console.log('Test 1 (Simple Eval): FAILED', e.message);
  }

  // Test 2: Dependency Resolution
  try {
    const components = [
      { code: 'HRA', formula: 'BASIC * 0.5', calculation_type: 'FORMULA' },
      { code: 'BASIC', formula: 'CTC * 0.4', calculation_type: 'FORMULA' }
    ];
    const ordered = DependencyResolver.resolveOrder(components);
    console.log('Test 2 (Dependency Resolution):', 
      ordered[0].code === 'BASIC' && ordered[1].code === 'HRA' ? 'PASSED' : 'FAILED');
  } catch (e: any) {
    console.log('Test 2 (Dependency Resolution): FAILED', e.message);
  }

  // Test 3: Circular Dependency
  try {
    const components = [
      { code: 'A', formula: 'B * 1', calculation_type: 'FORMULA' },
      { code: 'B', formula: 'A * 1', calculation_type: 'FORMULA' }
    ];
    DependencyResolver.resolveOrder(components);
    console.log('Test 3 (Circular Detection): FAILED (Should have thrown)');
  } catch (e: any) {
    console.log('Test 3 (Circular Detection): PASSED', `(${e.message})`);
  }

  console.log('--- Payroll Tests Completed ---');
};

if (require.main === module) {
  runPayrollTests();
}
