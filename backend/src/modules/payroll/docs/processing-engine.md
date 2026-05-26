# Payroll Operating System - Phase 2: Processing Engine Architecture

## Overview
Phase 2 transforms the Payroll OS from a configuration platform into an execution engine. It introduces monthly payroll cycles, immutable snapshots, and an automated calculation pipeline integrated with attendance.

## Core Architectural Components

### 1. Payroll Processing Engine (`PayrollProcessingService`)
The orchestrator that manages the lifecycle of a payroll batch.
- **Flow**: Cycle Start → Employee Selection → Attendance Fetch → Multi-step Calculation → Snapshot Creation → Persistence.
- **Error Isolation**: Failures at the employee level do not halt the entire batch. Errors are logged and the cycle is marked as `FAILED` if any employee fails.

### 2. Immutable Snapshots (`PayrollSnapshotService`)
To ensure compliance and historical accuracy, the system captures a JSON snapshot of:
- The full Salary Structure.
- Every Salary Component's metadata.
- The exact Formula used at the time of processing.
Even if a global formula (e.g., PF %) changes later, historical payroll remains unchanged.

### 3. Payroll Calculator (`PayrollCalculatorService`)
The math core that executes the formula dependency graph.
- **Variable Injection**: Injects `CTC`, `WORKING_DAYS`, `PAYABLE_DAYS`, and `LOP_DAYS` into the formula environment.
- **LOP Logic**: Calculates Loss of Pay deductions using the enterprise formula: `(monthly_salary / total_working_days) * lop_days`.

### 4. Attendance Abstraction (`AttendanceService`)
A decoupled layer that bridges the Payroll module with the EMS Attendance module.
- **Logic**: `Payable Days = Present Days + Paid Leaves + Holidays - LOP`.

## Payroll Lifecycle (Status Flow)
1. **DRAFT**: Cycle created, ready for review.
2. **PROCESSING**: Engine is currently calculating values.
3. **COMPLETED**: All employees processed successfully.
4. **FAILED**: One or more employees encountered calculation errors.
5. **LOCKED**: Results are finalized, immutable, and protected from recalculation.

## Database Immutability
- **`payroll_records`**: Stores the final gross, deductions, and net.
- **`payroll_component_values`**: Stores the row-level breakdown for every component.
- **`payroll_snapshots`**: Stores the raw configuration state.

## Security
- **RBAC**: Only `ADMIN` and `HR` roles can trigger processing or locking.
- **Locking**: The `PayrollLockService` enforces a strict check; if `is_locked` is true, all `POST/PUT/DELETE` operations on that record or cycle are rejected.
