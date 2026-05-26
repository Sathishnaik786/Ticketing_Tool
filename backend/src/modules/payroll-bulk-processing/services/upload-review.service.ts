import { supabaseAdmin } from '@lib/supabase';
import { MappingStatus, MatchedBy } from '../types/bulk-upload.types';

export class UploadReviewService {
  /**
   * Manually updates an employee mapping for a specific row.
   */
  static async updateMapping(params: {
    uploadId: string;
    rowId: string;
    employeeId: string;
    userId: string;
    notes?: string;
  }) {
    const { uploadId, rowId, employeeId, userId, notes } = params;

    // 1. Get old mapping for audit
    const { data: oldMapping } = await supabaseAdmin
      .from('payroll_bulk_row_mappings')
      .select('*')
      .eq('upload_row_id', rowId)
      .single();

    // 2. Update mapping
    const { data: newMapping, error: updateError } = await supabaseAdmin
      .from('payroll_bulk_row_mappings')
      .update({
        employee_id: employeeId,
        mapping_status: MappingStatus.MATCHED,
        mapping_confidence: 100,
        matched_by: MatchedBy.MANUAL_REVIEW,
        mapping_notes: notes || 'Manually reviewed and matched by Admin.'
      })
      .eq('upload_row_id', rowId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Log Audit
    await supabaseAdmin.from('payroll_bulk_mapping_audits').insert({
      upload_id: uploadId,
      upload_row_id: rowId,
      action_type: 'MANUAL_OVERRIDE',
      performed_by: userId,
      old_state: oldMapping || {},
      new_state: newMapping,
      metadata: { notes }
    });

    return newMapping;
  }
}
