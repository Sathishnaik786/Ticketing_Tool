import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ticketingApi } from '../services/ticketingService';
import type { TicketAttachment } from '../types/ticketing.types';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
};

const MAX_SIZE = 4 * 1024 * 1024;

interface TicketAttachmentUploadProps {
  ticketId: string;
  attachments: TicketAttachment[];
  onUpload: (file: File) => Promise<unknown>;
  isUploading?: boolean;
}

export function TicketAttachmentUpload({
  ticketId,
  attachments,
  onUpload,
  isUploading,
}: TicketAttachmentUploadProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        await onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: isUploading,
  });

  const inputProps = getInputProps({
    'aria-hidden': true,
    tabIndex: -1,
  });

  const describedBy = [
    'attachment-upload-help',
    fileRejections.length > 0 ? 'attachment-upload-errors' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const handleDownload = async (attachment: TicketAttachment) => {
    setDownloadingId(attachment.id);
    try {
      const response = await ticketingApi.getAttachmentUrl(ticketId, attachment.id);
      const url = response.data.signed_url;
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50',
          isUploading && 'opacity-60 pointer-events-none'
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload attachment dropzone. Press Enter or Space to browse files."
        aria-describedby={describedBy}
      >
        <input {...inputProps} />
        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium">
          {isDragActive ? 'Drop file here' : 'Drag and drop a file, or click to browse'}
        </p>
        <p id="attachment-upload-help" className="text-xs text-muted-foreground mt-2">
          PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, ZIP — max 4MB. Keyboard: Enter or Space to browse.
        </p>
        {isUploading && (
          <p className="text-sm text-primary mt-2 flex items-center justify-center gap-2" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Uploading...
          </p>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div id="attachment-upload-errors" role="alert" className="text-sm text-destructive">
          {fileRejections[0]?.errors[0]?.message ?? 'File rejected'}
        </div>
      )}

      <ul className="space-y-3" aria-label="Uploaded attachments">
        {attachments.map((attachment) => (
          <li
            key={attachment.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm truncate">{attachment.file_name}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDownload(attachment)}
              disabled={downloadingId === attachment.id}
              aria-busy={downloadingId === attachment.id}
              aria-label={`Download ${attachment.file_name}`}
            >
              {downloadingId === attachment.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
