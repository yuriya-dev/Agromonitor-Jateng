import { Router } from 'express';
import { getDashboardMetrics, getTransactions, getUsers, createUser, updateUser, deleteUser, syncKemendagDataController } from '../controllers/adminController';
import { getFieldReports, updateFieldReportStatus, aggregateApprovedFieldReports, getAggregationRuns, getAggregationRunById } from '../controllers/fieldReportController';

const router = Router();

router.get('/metrics', getDashboardMetrics);
router.get('/transactions', getTransactions);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/field-reports', getFieldReports);
router.put('/field-reports/:id', updateFieldReportStatus);
router.post('/field-reports/aggregate', aggregateApprovedFieldReports);
router.get('/aggregations', getAggregationRuns);
router.get('/aggregations/:id', getAggregationRunById);
router.post('/sync-kemendag', syncKemendagDataController);

export default router;
