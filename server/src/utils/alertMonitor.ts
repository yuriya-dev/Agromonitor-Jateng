import { PrismaClient } from '@prisma/client';
import { whatsappService } from './whatsappService';
import { sentNotificationsLog } from '../controllers/notificationController';

const prisma = new PrismaClient();

export const checkAndTriggerAlerts = async (commoditySlug: string, newPrice: number) => {
  console.log(`[ALERT MONITOR] Checking alerts for ${commoditySlug} at price Rp ${newPrice}...`);
  try {
    // Find all active (untriggered) alerts for this commodity
    const alerts = await prisma.priceAlert.findMany({
      where: {
        commoditySlug,
        isTriggered: false
      },
      include: {
        user: true
      }
    });

    if (alerts.length === 0) {
      console.log(`[ALERT MONITOR] No active alerts for ${commoditySlug}.`);
      return;
    }

    console.log(`[ALERT MONITOR] Found ${alerts.length} active alerts to evaluate.`);

    for (const alert of alerts) {
      let isConditionMet = false;
      if (alert.condition === 'above' && newPrice >= alert.targetPrice) {
        isConditionMet = true;
      } else if (alert.condition === 'below' && newPrice <= alert.targetPrice) {
        isConditionMet = true;
      }

      if (isConditionMet && alert.user && alert.user.whatsapp) {
        console.log(`[ALERT MONITOR] Alert condition met for User ${alert.user.name || alert.user.email} (alert threshold: ${alert.condition} Rp ${alert.targetPrice})`);
        
        // Fetch commodity name
        const commodity = await prisma.commodity.findUnique({
          where: { slug: commoditySlug }
        });
        const commodityName = commodity ? commodity.name : commoditySlug;

        const message = `🚨 *AGROMONITOR JATENG - PERINGATAN HARGA* 🚨\n\n` +
                        `📦 Komoditas: *${commodityName}*\n` +
                        `💰 Harga Baru: *Rp ${newPrice.toLocaleString('id-ID')}*\n` +
                        `🎯 Target Alert Anda: Harga ${alert.condition === 'above' ? 'NAIK DI ATAS' : 'TURUN DI BAWAH'} *Rp ${alert.targetPrice.toLocaleString('id-ID')}*\n\n` +
                        `Peringatan ini dipicu karena harga saat ini telah mencapai target preferensi Anda.`;

        // Send via WhatsApp
        const sent = await whatsappService.sendMessage(alert.user.whatsapp, message);

        // Record in notifications logs
        sentNotificationsLog.push({
          id: `NTF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-AL`,
          timestamp: new Date(),
          to: alert.user.whatsapp,
          type: 'WHATSAPP',
          name: alert.user.name || 'Pengguna',
          content: message
        });

        if (sent) {
          console.log(`[ALERT MONITOR] Actually sent WhatsApp price alert to ${alert.user.whatsapp}`);
        } else {
          console.log(`[ALERT MONITOR] (Simulation Fallback) Price alert log added for ${alert.user.whatsapp}`);
        }

        // Mark the alert as triggered
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: { isTriggered: true }
        });
      }
    }
  } catch (error) {
    console.error('[ALERT MONITOR] Error checking or triggering alerts:', error);
  }
};
