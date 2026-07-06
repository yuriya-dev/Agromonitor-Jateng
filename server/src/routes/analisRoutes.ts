import { Router } from 'express';
import {
  getAnalisMetrics,
  getArimaConfig,
  saveArimaConfig,
  getAlertConfig,
  saveAlertConfig,
  exportCsv,
  exportJson
} from '../controllers/analisController';

const router = Router();

router.get('/metrics', getAnalisMetrics);
router.get('/arima-config', getArimaConfig);
router.post('/arima-config', saveArimaConfig);
router.get('/alert-config', getAlertConfig);
router.post('/alert-config', saveAlertConfig);
router.get('/export/csv', exportCsv);
router.get('/export/json', exportJson);

export default router;
