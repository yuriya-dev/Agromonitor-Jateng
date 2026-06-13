import { Request, Response } from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface NotificationLog {
  id: string;
  timestamp: Date;
  to: string;
  type: 'WHATSAPP' | 'EMAIL' | 'TELEGRAM';
  content: string;
  name: string;
}

// Global in-memory log for simulation
export const sentNotificationsLog: NotificationLog[] = [];

// GET /api/notifications
export const getNotificationLogs = async (req: Request, res: Response) => {
  try {
    const logs = sentNotificationsLog.slice(-50).reverse(); // latest 50 logs
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/notifications/telegram
export const sendTelegramAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commodityName, condition, targetPrice, currentPrice } = req.body;
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      res.status(500).json({ 
        success: false, 
        message: "Konfigurasi Telegram (TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID) belum diset di backend." 
      });
      return;
    }

    const message = `🚨 *AGROMONITOR JATENG ALERT* 🚨\n\n` +
                    `📦 Komoditas: *${commodityName}*\n` +
                    `💰 Harga Saat Ini: Rp ${Number(currentPrice).toLocaleString('id-ID')}\n` +
                    `🎯 Kondisi Alert: Harga ${condition === 'above' ? 'NAIK DI ATAS' : 'TURUN DI BAWAH'} Rp ${Number(targetPrice).toLocaleString('id-ID')}\n\n` +
                    `Peringatan telah diaktifkan ke sistem pemantauan Anda.`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    });

    // Save to logs
    sentNotificationsLog.push({
      id: `NTF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-TG`,
      timestamp: new Date(),
      to: `Chat ID: ${chatId}`,
      type: 'TELEGRAM',
      name: 'System Alert',
      content: message
    });

    res.status(200).json({ success: true, message: "Notifikasi Telegram berhasil dikirim!" });
  } catch (error: any) {
    console.error("Error sending Telegram alert:", error.message);
    res.status(500).json({ success: false, message: "Gagal mengirim notifikasi Telegram" });
  }
};

// Core helper function to dispatch updates to users based on preferences
export const dispatchDailyNotifications = async () => {
  try {
    console.log('[NOTIFICATION SYSTEM] Starting daily notification dispatch...');
    
    // Find active subscribers
    const subscribers = await prisma.user.findMany({
      where: {
        notifyDaily: true,
        status: 'ACTIVE'
      }
    });
    
    if (subscribers.length === 0) {
      console.log('[NOTIFICATION SYSTEM] No active subscribers found.');
      return;
    }
    
    console.log(`[NOTIFICATION SYSTEM] Dispatching for ${subscribers.length} subscribers.`);
    
    // Fetch latest prices for commodities
    const commodities = await prisma.commodity.findMany({
      include: {
        prices: {
          orderBy: {
            date: 'desc'
          },
          take: 1
        }
      }
    });
    
    const priceMap = new Map<string, { price: number; name: string; unit: string }>();
    for (const c of commodities) {
      if (c.prices.length > 0) {
        priceMap.set(c.slug, {
          price: c.prices[0].price,
          name: c.name,
          unit: c.unit
        });
      }
    }
    
    for (const user of subscribers) {
      if (!user.preferences) continue;
      
      const prefs = user.preferences.split(',').map(s => s.trim()).filter(Boolean);
      if (prefs.length === 0) continue;
      
      let messageContent = `Halo ${user.name || 'Pengguna'},\n\nBerikut adalah update harga harian komoditas pilihan Anda untuk wilayah Jawa Tengah:\n`;
      let count = 0;
      
      for (const slug of prefs) {
        const info = priceMap.get(slug);
        if (info) {
          messageContent += `• *${info.name}*: Rp ${info.price.toLocaleString('id-ID')}/${info.unit}\n`;
          count++;
        }
      }
      
      if (count === 0) continue;
      
      messageContent += `\nTetap pantau harga pangan melalui portal Agromonitor Jateng.`;
      
      const baseId = `NTF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Send Email simulation
      if (user.email) {
        sentNotificationsLog.push({
          id: `${baseId}-EML`,
          timestamp: new Date(),
          to: user.email,
          type: 'EMAIL',
          name: user.name || 'Pengguna',
          content: messageContent
        });
        console.log(`[NOTIFICATION SYSTEM] [EMAIL] Sent to ${user.email}:\n${messageContent}\n---`);
      }
      
      // Send WhatsApp simulation
      if (user.whatsapp) {
        sentNotificationsLog.push({
          id: `${baseId}-WAP`,
          timestamp: new Date(),
          to: user.whatsapp,
          type: 'WHATSAPP',
          name: user.name || 'Pengguna',
          content: messageContent
        });
        console.log(`[NOTIFICATION SYSTEM] [WHATSAPP] Sent to ${user.whatsapp}:\n${messageContent}\n---`);
      }
    }
    
    console.log('[NOTIFICATION SYSTEM] Daily notification dispatch completed.');
  } catch (error) {
    console.error('[NOTIFICATION SYSTEM] Error dispatching daily updates:', error);
  }
};

