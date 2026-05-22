import { Router } from 'express';
import { getDashboardMetrics, getTransactions, getUsers, createUser, updateUser, deleteUser } from '../controllers/adminController';
import { getFieldReports, updateFieldReportStatus } from '../controllers/fieldReportController';
import { aggregateApprovedFieldReports } from '../controllers/fieldReportController';

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

export default router;
