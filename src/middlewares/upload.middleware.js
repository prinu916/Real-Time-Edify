// Using multer for multipart uploads.
// MVP: we accept a single file under field name `file`.

import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

