import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.js';
import { getDocuments, uploadDocument, removeDocument } from '../controllers/document.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});

const router = Router();

router.use(authenticate);
router.get('/', getDocuments);
router.post('/', upload.single('file'), uploadDocument);
router.delete('/:id', removeDocument);

export default router;

