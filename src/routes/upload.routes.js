import express from 'express';

import validateToken from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { uploadDocumentFromFile } from '../controllers/upload.controller.js';

const uploadRouter = express.Router();

// MVP upload: multipart/form-data, field name `file`
// URL: POST /api/v1/documents/upload
uploadRouter
  .route('/upload')
  .post(validateToken, upload.single('file'), uploadDocumentFromFile);

export default uploadRouter;

