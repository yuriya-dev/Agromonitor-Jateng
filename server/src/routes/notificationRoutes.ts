import express from 'express';
import { sendTelegramAlert } from '../controllers/notificationController';

const router = express.Router();

router.post('/telegram', sendTelegramAlert);

export default router;
