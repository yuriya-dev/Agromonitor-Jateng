import express from 'express';
import { sendTelegramAlert, getNotificationLogs } from '../controllers/notificationController';

const router = express.Router();

router.post('/telegram', sendTelegramAlert);
router.get('/', getNotificationLogs);

export default router;
