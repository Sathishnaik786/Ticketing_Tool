# Payroll Operating System - Phase 5: Finance & ERP Integration Architecture

## Overview
Phase 5 bridges the gap between payroll execution and corporate financial accounting. It introduces a double-entry accounting engine that translates payroll components into General Ledger (GL) postings and manages the salary disbursement lifecycle.

## Core Architectural Components

### 1. Journal Entry Engine (`JournalEngineService`)
Automates the creation of double-entry accounting lines based on payroll results.
- **Rules**: For every earning component, a DEBIT (Expense) and a CREDIT (Payable) entry is generated.
- **Integrity**: Ensures `Total Debit == Total Credit` for every journal header.
- **Immutability**: Once a journal is `POSTED`, it cannot be edited. Corrections require a `REVERSED` journal.

### 2. Disbursement Lifecycle (`DisbursementService`)
Tracks the movement of funds from the company bank account to employee accounts.
- **States**: PENDING → SCHEDULED → PROCESSING → SUCCESS/FAILED.
- **Audit**: Every payout is linked to a `bank_reference_no` and timestamp.

### 3. ERP Connector Framework (`/services/erp-connectors`)
A pluggable architecture for exporting financial data to external accounting systems.
- **Exporters**: Support for Tally (XML), SAP (CSV), and Oracle (Excel).
- **Consistency**: All exports are derived from the immutable `payroll_journal_entries`.

### 4. Financial Reconciliation (`ReconciliationService`)
A validation layer that ensures the "Net Salary Payable" in payroll matches the "Net Salary Disbursed" in the banking module.

## Financial Governance
- **Double-Entry Compliance**: All payroll transactions must have balanced debits and credits.
- **Role-Based Access (RBAC)**: Only users with `FINANCE` or `ADMIN` roles can access journal postings and disbursement dashboards.
- **Snapshot Usage**: Financial postings are always generated from frozen payroll snapshots to ensure historical consistency.

## Data Flow
1. **Payroll Finalized** → Cycle is locked.
2. **Journal Post** → `JournalEngine` generates lines based on GL mappings.
3. **Disbursement Initiate** → `DisbursementService` creates pending payouts for Net Salary.
4. **ERP Export** → Finance team downloads Tally/SAP files for corporate bookkeeping.
5. **Reconciliation** → System matches processed payouts against expected totals.
