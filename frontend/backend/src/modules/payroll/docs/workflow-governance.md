# Payroll Operating System - Phase 4: Workflow & Governance Architecture

## Overview
Phase 4 implements the enterprise governance layer, transforming payroll from a functional tool into a controlled financial system. It ensures that no payroll can be finalized without multi-level scrutiny and anomaly detection.

## Core Architectural Components

### 1. Workflow Engine (`WorkflowEngineService`)
A state-machine based engine that manages sequential approval steps.
- **Dynamic Routing**: Steps are ordered by `step_order`. Completion of one step automatically initiates the next.
- **SLA Tracking**: Each step has a target `sla_hours`.
- **Termination**: Final step completion marks the cycle as `APPROVED`, ready for locking.

### 2. Variance Detection Engine (`VarianceDetectionService`)
An automated audit tool that runs before the workflow starts.
- **Logic**: Compares current payroll records against the last `LOCKED` record for the same employee.
- **Flags**: Gross salary spikes (>20%), deduction drops, and negative net salaries.
- **Severity**: Critical (Negative Net), High (>50% variance), Medium (>20%).

### 3. Payroll Reopen Workflow (`PayrollReopenService`)
A security control for correcting mistakes in a finalized payroll.
- **Protocol**: Locked payrolls are immutable. To correct them, an admin must approve a "Reopen Request".
- **Preservation**: Reopening resets status but the audit trail preserves why and who requested the change.

### 4. Notification Engine (`PayrollNotificationService`)
Real-time alerting for workflow events.
- **Triggers**: Approval requests, rejections, escalations, and locking.

## Governance Lifecycle
1. **DRAFT** → Cycle setup.
2. **PROCESSING** → Calculation and Snapshotting.
3. **PENDING_APPROVAL** → Variance detection triggers and Workflow Step 1 initiates.
4. **APPROVED** → All workflow levels cleared.
5. **LOCKED** → Records become immutable.

## Audit & Compliance
The `WorkflowAuditService` captures every state transition, ensuring a complete trail for internal and external auditors.
- **Who**: Performer ID.
- **What**: Action (Approve/Reject/Reopen).
- **When**: Timestamp.
- **Why**: Comments and Metadata.
