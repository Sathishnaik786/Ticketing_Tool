const AppError = require('../../../utils/app-error');
const {
  ACTIVITY_TYPES,
  ATTACHMENT_BUCKET,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  assertPermission,
  buildAttachmentPath,
  isBlockedAttachment,
  successResponse,
} = require('../ticketing.types');
const { UploadAttachmentSchema, parseSchema } = require('../validators/ticketing.validator');

class AttachmentService {
  constructor(deps = {}) {
    this.db = deps.supabaseAdmin || require('@lib/supabase').supabaseAdmin;
    const sharedDeps = { ...deps, supabaseAdmin: this.db };
    this.activityService = deps.activityService || new (require('./activity.service'))(sharedDeps);
    this.ticketAccess = deps.ticketAccess || require('./ticket-access.helper');
  }

  async createAttachment(user, ticketId, file, metadata = {}) {
    assertPermission(user, 'UPLOAD_ATTACHMENT');

    if (!file || !file.buffer) {
      throw AppError.badRequest('File buffer is required');
    }

    const input = parseSchema(UploadAttachmentSchema, {
      file_name: metadata.file_name || file.originalname,
      mime_type: metadata.mime_type || file.mimetype,
      file_size: metadata.file_size || file.size,
    }, 'Upload attachment');

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES || input.file_size > MAX_ATTACHMENT_SIZE_BYTES) {
      throw AppError.badRequest('File size exceeds 4MB limit');
    }

    if (isBlockedAttachment(input.file_name, input.mime_type)) {
      throw AppError.badRequest('File type is not allowed');
    }

    if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(input.mime_type)) {
      throw AppError.badRequest('MIME type is not allowed');
    }

    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    await this.ticketAccess.assertCanView(this.db, user, ticket);

    const filePath = buildAttachmentPath(ticketId, input.file_name);

    const { error: uploadError } = await this.db.storage
      .from(ATTACHMENT_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: input.mime_type,
        upsert: false,
      });

    if (uploadError) {
      throw AppError.internal('Unable to upload attachment');
    }

    const { data, error } = await this.db
      .from('ticket_attachments')
      .insert([{
        ticket_id: ticketId,
        uploaded_by: user.employeeId,
        file_name: input.file_name,
        file_path: filePath,
        file_size: input.file_size,
        mime_type: input.mime_type,
      }])
      .select()
      .single();

    if (error) {
      throw AppError.internal('Unable to save attachment metadata');
    }

    await this.activityService.logActivity({
      ticketId,
      actorId: user.employeeId,
      activityType: ACTIVITY_TYPES.ATTACHMENT,
      newValue: {
        attachment_id: data.id,
        file_name: input.file_name,
      },
      description: 'Attachment added',
    });

    const { logTicketingEvent } = require('../lib/ticketing-logger');
    logTicketingEvent('attachment_uploaded', {
      ticketId,
      attachmentId: data.id,
      mimeType: input.mime_type,
      fileSize: input.file_size,
    });

    return successResponse(data);
  }

  async getSignedUrl(user, ticketId, attachmentId, expiresIn = 3600) {
    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    await this.ticketAccess.assertCanView(this.db, user, ticket);

    const { data: attachment, error } = await this.db
      .from('ticket_attachments')
      .select('*')
      .eq('id', attachmentId)
      .eq('ticket_id', ticketId)
      .single();

    if (error?.code === 'PGRST116') {
      throw AppError.notFound('Attachment not found');
    }
    if (error) {
      throw AppError.internal('Unable to fetch attachment');
    }

    const { data: signed, error: signedError } = await this.db.storage
      .from(ATTACHMENT_BUCKET)
      .createSignedUrl(attachment.file_path, expiresIn);

    if (signedError) {
      throw AppError.internal('Unable to generate signed URL');
    }

    return successResponse({
      attachment,
      signed_url: signed.signedUrl,
      expires_in: expiresIn,
    });
  }

  async listAttachments(user, ticketId) {
    const ticket = await this.ticketAccess.getTicketOrThrow(this.db, ticketId);
    await this.ticketAccess.assertCanView(this.db, user, ticket);

    const { data, error } = await this.db
      .from('ticket_attachments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) {
      throw AppError.internal('Unable to fetch attachments');
    }

    return successResponse(data || []);
  }
}

module.exports = AttachmentService;
