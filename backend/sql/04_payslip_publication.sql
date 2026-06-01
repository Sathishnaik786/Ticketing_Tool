-- =======================================================================================
-- MIGRATION: Safe Enterprise Payslip Disbursement & Publication Workflow
-- DESCRIPTION: Adds publication workflow to employee_payslip_documents and creates
--              an audit table for tracking views, downloads, and publications.
-- =======================================================================================

-- 1. Extend the employee_payslip_documents table
ALTER TABLE public.employee_payslip_documents
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- 2. Create Audit Table
CREATE TABLE IF NOT EXISTS public.payslip_publication_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- e.g., 'PAYSLIP_PUBLISHED', 'PAYSLIP_VIEWED', 'PAYSLIP_DOWNLOADED'
    employee_id UUID NOT NULL,
    document_id UUID NOT NULL REFERENCES public.employee_payslip_documents(id) ON DELETE CASCADE,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add Indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_payslip_documents_published 
ON public.employee_payslip_documents(employee_id) 
WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS idx_payslip_publication_audits_doc_event 
ON public.payslip_publication_audits(document_id, event_type);

-- =======================================================================================
-- INSTRUCTIONS: Please execute this script in your Supabase SQL Editor.
-- =======================================================================================
