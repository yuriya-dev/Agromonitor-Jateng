import { Router } from 'express';
import { getDashboardMetrics, getTransactions, getUsers, createUser, updateUser, deleteUser } from '../controllers/adminController';

const router = Router();

router.get('/metrics', getDashboardMetrics);
router.get('/transactions', getTransactions);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
