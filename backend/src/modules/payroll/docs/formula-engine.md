# Payroll Operating System - Formula Engine Documentation

## Overview
The Payroll Formula Engine is a high-performance, safe, and configurable component designed to evaluate complex salary calculations without hardcoding logic. It uses `mathjs` as the core evaluation library and includes a dependency resolution layer to handle multi-step calculations.

## Core Principles
1. **No Hardcoding**: All calculations are stored in the database.
2. **Safety First**: Prevents execution of arbitrary JavaScript. Only mathematical expressions are allowed.
3. **Dependency Awareness**: Automatically determines the order of calculation based on variable dependencies.
4. **Circular Detection**: Prevents infinite loops in formula definitions.

## Formula Syntax
Formulas follow standard mathematical notation. You can use predefined variables and mathematical functions.

### Supported Variables
- `CTC`: The monthly Cost to Company.
- `ANNUAL_CTC`: The annual Cost to Company.
- `gross`: The running total of all components in the `EARNING` category.
- `net`: The running total of `EARNINGS` minus `DEDUCTIONS`.
- **Component Codes**: Any salary component `code` (e.g., `BASIC`, `HRA`) can be used as a variable in subsequent formulas.

### Examples
- **Basic Salary**: `CTC * 0.40`
- **HRA**: `BASIC * 0.50`
- **Provident Fund**: `BASIC * 0.12`
- **Special Allowance**: `gross - (BASIC + HRA + CA + MA)`

## Dependency Resolution
The engine uses a topological sort algorithm. If `HRA` depends on `BASIC`, the engine ensures `BASIC` is calculated first.

## API Usage
### Backend Evaluation
```typescript
const result = FormulaEvaluator.evaluate("BASIC * 0.5", { BASIC: 20000 });
// returns 10000
```

### Dependency Order
```typescript
const ordered = DependencyResolver.resolveOrder(components);
// returns components in the correct calculation sequence
```

## Security
- **Sanitization**: Formulas are parsed into an Abstract Syntax Tree (AST) by `mathjs`.
- **Validation**: Zod and custom regex ensure only safe patterns are saved.
- **Audit**: All formula changes are logged in `payroll_audit_logs`.
