# Payroll Operating System - Phase 3: Compliance & Payslips Architecture

## Overview
Phase 3 establishes the legal and document-centric foundation of the Payroll OS. It introduces a configurable compliance engine for statutory deductions (PF, ESI, PT, TDS) and a snapshot-based PDF generation system for payslips.

## Core Architectural Components

### 1. Compliance Engine (`/services/compliance`)
A configurable engine that calculates statutory liabilities without hardcoding formulas.
- **PF Engine**: Handles basic capping and 12% calculation.
- **ESI Engine**: Handles eligibility checks (e.g. < 21k) and split percentages.
- **PT Engine**: State-specific slab-based calculation.
- **TDS Foundation**: Tax slab lookup, regime support (Old/New), and monthly estimation.
- **Employer Contribution**: Calculates non-salary liabilities (Employer PF/ESI).

### 2. Payslip Engine (`/services/payslip-engine`)
An immutable document generation pipeline.
- **Snapshot Requirement**: Payslips are generated *only* from `payroll_snapshots` and `statutory_deductions`. They never query live salary structures to ensure historical accuracy.
- **PDF Generation**: Uses **Puppeteer** for pixel-perfect A4 rendering.
- **Hashing**: Every payslip PDF is hashed (SHA256) and assigned a unique verification token.

### 3. Statutory & Contribution Tracking
- **`statutory_deductions`**: Stores employee and employer shares for audit and reporting.
- **`employer_contributions`**: Tracks liabilities that do not affect employee net salary but are part of the total payroll cost.

### 4. Employee Self-Service (ESS)
- A dedicated portal for employees to view historical salary records.
- Secure, immutable document access with verification badges.

## Compliance Rule System
Rules are versioned using `effective_from` and `effective_to` dates. The engine automatically selects the rule active during the payroll cycle period.

## Data Immutability Rules
- **Rule 1**: Generated payslips cannot be updated. To correct a payslip, the payroll record must be recalculated (if not locked) and a new payslip generated.
- **Rule 2**: Once a payroll cycle is `LOCKED`, the associated compliance rules and snapshots are frozen.
