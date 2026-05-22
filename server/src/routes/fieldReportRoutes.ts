import { Router } from 'express';
import { createFieldReport } from '../controllers/fieldReportController';

const router = Router();

router.post('/', createFieldReport);

export default router;