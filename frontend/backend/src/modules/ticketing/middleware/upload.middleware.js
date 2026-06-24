const multer = require('multer');
const AppError = require('../../../utils/app-error');
const { MAX_ATTACHMENT_SIZE_BYTES } = require('../ticketing.types');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'application/zip',
  'application/x-zip-compressed',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_ATTACHMENT_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(AppError.badRequest('File type is not allowed'));
  },
});

function handleUploadError(err, req, res, next) {
  if (!err) {
    return next();
  }

  if (err instanceof AppError) {
    return next(err);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return next(AppError.badRequest('File size exceeds 4MB limit'));
  }

  return next(AppError.badRequest(err.message || 'File upload failed'));
}

module.exports = {
  uploadAttachment: upload.single('file'),
  handleUploadError,
};
