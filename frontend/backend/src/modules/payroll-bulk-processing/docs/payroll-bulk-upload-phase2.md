# Payroll Bulk Upload & Validation System (Phase-2)

## Architecture Overview

Phase-2 focuses on **Identity Resolution** and **Financial Preview**. It transforms raw validated Excel rows into system-aware entities by mapping them to the employee directory and detecting operational conflicts.

### Mapping Engine

- **Confidence Scoring**: Uses a multi-criteria scoring model (Code, Name, Department) to determine match reliability.
- **Matched By**: Tracks whether a match was found via `EMPLOYEE_CODE`, `EMPLOYEE_NAME`, or `MANUAL_REVIEW`.
- **Organization Awareness**: All lookups are filtered by `organization_id` to ensure multi-tenant security.

### Conflict Detection

- **Duplicate Records**: The `DuplicateCheckService` queries existing `payroll_records` to prevent double-payment for the same employee in the same period (month/year).
- **Ambiguous Matches**: Highlights rows where name matches multiple employees or only partial data is available.

### Preview Engine

- **Real-time Aggregation**: Computes batch totals for Gross and Net salary.
- **Operational States**:
  - `READY`: All identities resolved, no conflicts.
  - `REVIEW_REQUIRED`: Identity gaps or duplicate warnings detected.
  - `BLOCKED`: Critical structural failures (e.g., mismatch in organization records).

## Review Workflow

1. **Discovery**: Admin searches the entity directory for unresolved rows.
2. **Override**: Admin selects the correct employee and provides reasoning.
3. **Audit**: Every change is logged in `payroll_bulk_mapping_audits` with `old_state` and `new_state` snapshots.

## API Endpoints (New in Phase-2)

- `POST /api/payroll-bulk/:uploadId/map-employees`: Trigger the batch mapping process.
- `GET /api/payroll-bulk/:uploadId/mappings`: Fetch resolved identities and confidence scores.
- `GET /api/payroll-bulk/:uploadId/preview`: Retrieve aggregate financial preview.
- `POST /api/payroll-bulk/:uploadId/review/:rowId`: Manually override a mapping.
- `POST /api/payroll-bulk/:uploadId/recalculate-preview`: Force update of preview analytics.

## Security Controls

- **Tenant Isolation**: Mapping lookups are strictly bound to the user's `organization_id`.
- **Immutable History**: Original Excel data remains unchanged; mapping resides in a linked table.
- **RBAC**: Review actions are restricted to `ADMIN` and `HR`.
