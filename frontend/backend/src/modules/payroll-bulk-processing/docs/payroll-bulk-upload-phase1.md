# Payroll Bulk Upload & Validation System (Phase-1)

## Architecture Overview

The Payroll Bulk Upload system provides an enterprise-grade ingestion engine for payroll records. Phase-1 focuses on structural and business logic validation before any data is committed to the main HR/Payroll masters.

### Component Structure

- **Excel Parser Service**: Uses `exceljs` to parse `.xlsx` files with flexible header mapping and formula support.
- **Validation Engine**: Uses `Zod` for strict schema enforcement, checking for data types, range constraints, and mandatory fields.
- **Bulk Upload Orchestrator**: Manages the lifecycle of an upload from ingestion to persistence of validation results.
- **Persistence Layer**: Tracks every upload batch and individual row-level results in dedicated PostgreSQL tables.

## Data Flow

1. **Ingestion**: File uploaded via Multer with MIME and size (10MB) validation.
2. **Parsing**: Rows extracted and normalized into structured JSON.
3. **Validation**: Each row is checked against the Zod schema.
4. **Deduplication**: In-file duplicate checking for `employee_code`.
5. **Persistence**: Summary and row-level results (including errors) are saved to Supabase.
6. **Reporting**: Frontend fetches validation results for HR review.

## Excel Format (Expected Columns)

| Column Name | Required | Type | Validation |
|-------------|----------|------|------------|
| Employee Code | Yes | String | Min 1 char |
| Employee Name | Yes | String | Min 1 char |
| Month | Yes | Number | 1 - 12 |
| Year | Yes | Number | 2000 - 2100 |
| Basic | Yes | Numeric | >= 0 |
| Gross Salary | Yes | Numeric | >= 0 |
| Net Salary | Yes | Numeric | <= Gross |

## Security Controls

- **RBAC**: Access restricted to `ADMIN` and `HR` roles via `requireRole` middleware.
- **File Safety**: MIME type check (OpenXML) and size limits (10MB).
- **Isolation**: Each batch is stored with its own UUID and audit metadata.
- **Persistence**: Raw data is preserved for auditability in case of disputes.

## API Documentation

- `POST /api/payroll-bulk/upload`: Ingest and validate file.
- `GET /api/payroll-bulk/uploads`: List batch history.
- `GET /api/payroll-bulk/uploads/:id`: Get batch summary.
- `GET /api/payroll-bulk/uploads/:id/rows`: Get row-level validation data.
