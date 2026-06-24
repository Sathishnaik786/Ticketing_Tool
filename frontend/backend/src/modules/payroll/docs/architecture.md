# Payroll Operating System Architecture

## Overview
Phase 1 implements the foundation of a production-grade Payroll OS. The architecture is modular, scalable, and built using the Service-Repository pattern.

## Directory Structure
```
/payroll
├── controllers/       # Request handling and response mapping
├── services/          # Core business logic and formula evaluation
├── repositories/      # Database interactions (Supabase/PostgreSQL)
├── routes/            # API endpoints with RBAC protection
├── middleware/        # Payroll-specific security and validation
├── formula-engine/    # Mathjs-based calculation logic
├── validators/        # Zod schemas for DTO validation
├── types/             # TypeScript interfaces
├── docs/              # Technical documentation
└── tests/             # Unit and integration tests
```

## Data Model
- **salary_components**: Atomic units of pay (Basic, HRA, PF).
- **salary_structures**: Groupings of components that form a pay scale.
- **employee_salary_assignments**: Mapping of structures to employees with CTC and effective dates.
- **payroll_settings**: Global configuration (cycles, currency).
- **payroll_audit_logs**: Complete trail of all administrative actions.

## Security & RBAC
Permissions are integrated into the existing EMS system:
- `payroll.full_access`: Full control (Admin).
- `payroll.manage_salary`: Create/Edit structures and components (HR).
- `payroll.view`: Read-only access to payroll data (HR/Manager).

## Scalability
- **Pluggable Architecture**: New components can be added via the UI without code changes.
- **Database Driven**: Calculations are evaluated at runtime, allowing for instant policy updates.
- **Audit Ready**: Every change is versioned and logged.
