import express from 'express';
import { 
  sendTelegramAlert, 
  sendWhatsAppAlert,
  getNotificationLogs, 
  getWhatsAppStatus, 
  connectWhatsApp, 
  disconnectWhatsApp 
} from '../controllers/notificationController';

const router = express.Router();

router.get('/', getNotificationLogs);
router.post('/telegram', sendTelegramAlert);
router.post('/whatsapp', sendWhatsAppAlert);
router.get('/whatsapp/status', getWhatsAppStatus);
router.post('/whatsapp/connect', connectWhatsApp);
router.post('/whatsapp/disconnect', disconnectWhatsApp);

export default router;
