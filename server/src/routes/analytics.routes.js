import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getAnalytics } from '../controllers/analytics.controller.js';
import { getAnomalies } from '../controllers/anomaly.controller.js';

const router = Router();

router.use(authenticate);
router.get('/summary', getAnalytics);
router.get('/anomalies', getAnomalies);

export default router;

