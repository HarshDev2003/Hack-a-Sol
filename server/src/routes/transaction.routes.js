import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getTransactions, getTransactionsSummary } from '../controllers/transaction.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', getTransactions);
router.get('/summary', getTransactionsSummary);

export default router;

