# Audit RBAC Report — Phase 9.2

## Access Control Matrix
Only privileged actors are authorized to view or query system audit logs. The table below represents the enforced governance permissions.

| Endpoint | Allowed Roles | DB Policy (RLS) | Frontend Visibility |
|---|---|---|---|
| `GET /api/v1/audit` | `ADMIN`, `HR` | Enforced via join check | Hidden for other roles |
| Action Logs | System (Bypass) | Bypassed via service role client | Not applicable |

## RLS Database Policy
Row Level Security (RLS) is enabled on the `audit_logs` table. Only users verified as `ADMIN` or `HR` are allowed to perform queries:

```sql
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ADMIN and HR to select audit logs" ON public.audit_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id = auth.uid()
    AND employees.role IN ('ADMIN', 'HR')
  )
);
```

## Security Controls
- **Immutability**: No RLS policies allow `UPDATE` or `DELETE` commands. Once written, audit trails cannot be altered or removed.
- **Credential Masking**: Traversals inspect and sanitise any sensitive payloads before saving logs.
- **Client Shielding**: Unauthorized access returns `403 Forbidden` on the API layer and is blocked from loading in the user interface.
