-- FIX: Add missing metadata column to payroll_bulk_preview_summaries
ALTER TABLE payroll_bulk_preview_summaries
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Ensure indexes are consistent
CREATE INDEX IF NOT EXISTS idx_preview_summaries_metadata ON payroll_bulk_preview_summaries USING GIN (metadata);
