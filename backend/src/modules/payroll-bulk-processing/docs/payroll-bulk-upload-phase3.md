# Payroll Bulk Upload & Validation System (Phase-3)

## Architecture Overview

Phase-3 implements the **Official Commitment Layer**. It transitions validated mappings into immutable financial records and generates regulatory-compliant payslip documentation.

### Commitment Engine

- **Transactional Integrity**: Ensures that core `payroll_records` and `employee_payslip_documents` are created in sync.
- **Isolating Failures**: Uses individual row processing within the batch to ensure a single row failure does not corrupt the entire commitment.
- **Audit Logging**: Every step (Record Created -> PDF Generated -> Storage Uploaded) is logged in `payroll_commitment_audits`.

### Payslip Generation Flow

1. **HTML Rendering**: Uses `handlebars` to inject dynamic employee and financial data into a professional enterprise template.
2. **PDF Conversion**: `puppeteer` (headless Chrome) renders the HTML with CSS into an A4 optimized PDF buffer.
3. **Immutability**: Every PDF is hashed (SHA-256) upon generation. The hash is stored in the database to detect any future document tampering.
4. **Verification**: Generates a unique verification token for each payslip.

### Secure Storage & Distribution

- **Isolation**: PDFs are stored in employee-specific paths: `employee-payslips/{employee_id}/{payslip_number}.pdf`.
- **Signed Access**: Download links are generated on-demand with a 1-hour expiry using `createSignedUrl`.
- **RBAC**: Employees can only access documents where `employee_id` matches their authenticated `user_id`.

## API Endpoints (New in Phase-3)

### Admin/HR
- `POST /api/payroll-bulk/:uploadId/commit`: Orchestrate the commitment and generation process.
- `GET /api/payroll-bulk/commitments`: Review historical commitment batches.

### Employee Self-Service
- `GET /api/my-payslips/my/payslips`: List authorized statements.
- `GET /api/my-payslips/my/payslips/download/:id`: Retrieve secure download link.

## Security Controls

- **Document Hashing**: Prevents unauthorized modifications to generated PDFs.
- **Signed URLs**: Prevents direct public access to storage buckets.
- **Download Tracking**: All payslip downloads are logged with IP and User-Agent metadata.
- **RLS Policies**: Postgres-level security ensures row isolation at the database layer.
