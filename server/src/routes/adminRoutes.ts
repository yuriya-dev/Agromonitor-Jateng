import { Router } from 'express';
import { getDashboardMetrics, getTransactions } from '../controllers/adminController';

const router = Router();

router.get('/metrics', getDashboardMetrics);
router.get('/transactions', getTransactions);

export default router;
