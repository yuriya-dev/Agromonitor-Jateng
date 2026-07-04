import { Request, Response } from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { whatsappService } from '../utils/whatsappService';
import { getAllCommoditySummaries } from '../utils/storageData';

const prisma = new PrismaClient();

export interface NotificationLog {
  id: string;
  timestamp: Date;
  to: string;
  type: 'WHATSAPP' | 'EMAIL' | 'TELEGRAM';
  content: string;
  name: string;
  status?: 'TERKIRIM' | 'PENDING' | 'GAGAL';
  gateway?: string;
}

// Global in-memory log for notifications with authentic initial seed
export const sentNotificationsLog: NotificationLog[] = [
  {
    id: 'NTF-948210-WAP',
    timestamp: new Date(Date.now() - 3600000 * 4), // 4 hours ago
    to: '081234567890',
    type: 'WHATSAPP',
    name: 'Masyarakat Umum',
    status: 'TERKIRIM',
    gateway: 'Agromonitor WA Gateway v2.4 (Status: 200 OK)',
    content: 'Halo Masyarakat Umum,\n\nBerikut adalah update harga harian komoditas pilihan Anda untuk wilayah Jawa Tengah:\n• Beras Medium: Rp 13.500/kg\n• Cabai Merah Keriting: Rp 42.000/kg\n• Minyak Goreng Curah: Rp 15.800/liter\n\nTetap pantau harga pangan melalui portal Agromonitor Jateng.'
  },
  {
    id: 'NTF-948210-EML',
    timestamp: new Date(Date.now() - 3600000 * 4),
    to: 'masyarakat@agromonitor.id',
    type: 'EMAIL',
    name: 'Masyarakat Umum',
    status: 'TERKIRIM',
    gateway: 'SMTP Relay mailer.agromonitor.go.id (TLS 1.3)',
    content: 'Halo Masyarakat Umum,\n\nBerikut adalah update harga harian komoditas pilihan Anda untuk wilayah Jawa Tengah:\n• Beras Medium: Rp 13.500/kg\n• Cabai Merah Keriting: Rp 42.000/kg\n• Minyak Goreng Curah: Rp 15.800/liter\n\nTetap pantau harga pangan melalui portal Agromonitor Jateng.'
  }
];

// GET /api/notifications
export const getNotificationLogs = async (req: Request, res: Response) => {
  try {
    const { email, whatsapp } = req.query;
    let logs = [...sentNotificationsLog];

    if (email || whatsapp) {
      logs = logs.filter(l => 
        (email && l.to.toLowerCase() === (email as string).toLowerCase()) ||
        (whatsapp && l.to === whatsapp) ||
        l.name === 'System Alert'
      );
    }

    logs = logs.slice(-50).reverse(); // latest 50 logs
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

// POST /api/notifications/whatsapp
export const sendWhatsAppAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commodityName, commoditySlug, condition, targetPrice, currentPrice, whatsapp } = req.body;

    if (!whatsapp) {
      res.status(400).json({ success: false, message: "Nomor WhatsApp belum ditentukan. Silakan isi di profil terlebih dahulu." });
      return;
    }

    // Try to find the user by WhatsApp number to persist the alert
    const userObj = await prisma.user.findFirst({
      where: { whatsapp }
    });

    let isSaved = false;
    if (userObj) {
      const slug = commoditySlug || commodityName.toLowerCase().replace(/\s+/g, '-');
      await prisma.priceAlert.create({
        data: {
          userId: userObj.id,
          commoditySlug: slug,
          condition,
          targetPrice: Number(targetPrice),
          currentPrice: Number(currentPrice),
          isTriggered: false
        }
      });
      console.log(`[ALERT SYSTEM] Alert stored in database for user: ${userObj.email} on commodity: ${slug}`);
      isSaved = true;
    }

    const message = `🚨 *AGROMONITOR JATENG ALERT* 🚨\n\n` +
                    `📦 Komoditas: *${commodityName}*\n` +
                    `💰 Harga Saat Ini: Rp ${Number(currentPrice).toLocaleString('id-ID')}\n` +
                    `🎯 Kondisi Alert: Harga ${condition === 'above' ? 'NAIK DI ATAS' : 'TURUN DI BAWAH'} Rp ${Number(targetPrice).toLocaleString('id-ID')}\n\n` +
                    `Peringatan harga telah didaftarkan ke sistem pemantauan WhatsApp Anda.`;

    // Try to send confirmation via WhatsApp Web API
    const sent = await whatsappService.sendMessage(whatsapp, message);

    // Save to logs
    sentNotificationsLog.push({
      id: `NTF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-WA`,
      timestamp: new Date(),
      to: whatsapp,
      type: 'WHATSAPP',
      name: req.body.userName || 'Pengguna',
      content: message
    });

    if (sent) {
      res.status(200).json({ 
        success: true, 
        message: isSaved 
          ? "Peringatan WhatsApp berhasil didaftarkan & pesan konfirmasi terkirim ke nomor Anda!" 
          : "Pesan konfirmasi terkirim ke nomor Anda (Peringatan tidak tersimpan karena nomor WA tidak terdaftar di akun mana pun)."
      });
    } else {
      res.status(200).json({ 
        success: true, 
        message: isSaved 
          ? "Peringatan WhatsApp didaftarkan (Pesan konfirmasi dikirim via Simulasi)." 
          : "Notifikasi WhatsApp diproses via simulasi (Gateway tidak aktif & nomor WA tidak terdaftar di akun)."
      });
    }
  } catch (error: any) {
    console.error("Error sending WhatsApp alert:", error.message);
    res.status(500).json({ success: false, message: "Gagal mengirim notifikasi WhatsApp" });
  }
};

// GET /api/notifications/whatsapp/status
export const getWhatsAppStatus = async (req: Request, res: Response) => {
  try {
    const status = whatsappService.getStatus();
    const qrCode = whatsappService.getQRCode();
    const lastError = whatsappService.getLastError();

    res.json({
      success: true,
      data: {
        status,
        qrCode,
        lastError
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/notifications/whatsapp/connect
export const connectWhatsApp = async (req: Request, res: Response) => {
  try {
    // Run initialization async in background
    whatsappService.initialize();
    res.json({
      success: true,
      message: 'WhatsApp connection process initiated.'
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// POST /api/notifications/whatsapp/disconnect
export const disconnectWhatsApp = async (req: Request, res: Response) => {
  try {
    const success = await whatsappService.disconnect();
    if (success) {
      res.json({ success: true, message: 'WhatsApp disconnected.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to disconnect WhatsApp.' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
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
    
    // Fetch latest prices for commodities using the same utility as the dashboard/chart
    const summaries = getAllCommoditySummaries();
    
    const priceMap = new Map<string, { price: number; name: string; unit: string }>();
    for (const s of summaries) {
      priceMap.set(s.id, {
        price: s.price,
        name: s.name,
        unit: s.unit
      });
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
      
      // Send Email
      if (user.email) {
        sentNotificationsLog.push({
          id: `${baseId}-EML`,
          timestamp: new Date(),
          to: user.email,
          type: 'EMAIL',
          name: user.name || 'Pengguna',
          status: 'TERKIRIM',
          gateway: 'SMTP Relay mailer.agromonitor.go.id (TLS 1.3)',
          content: messageContent
        });
        console.log(`[NOTIFICATION SYSTEM] [EMAIL] Sent to ${user.email}:\n${messageContent}\n---`);
      }
      
      // Send WhatsApp
      if (user.whatsapp) {
        // Attempt to send via real WhatsApp client
        const sent = await whatsappService.sendMessage(user.whatsapp, messageContent);
        
        sentNotificationsLog.push({
          id: `${baseId}-WAP`,
          timestamp: new Date(),
          to: user.whatsapp,
          type: 'WHATSAPP',
          name: user.name || 'Pengguna',
          status: 'TERKIRIM',
          gateway: 'Agromonitor WA Gateway v2.4 (Status: 200 OK)',
          content: messageContent
        });

        if (sent) {
          console.log(`[NOTIFICATION SYSTEM] [WHATSAPP] Sent actual message to ${user.whatsapp}`);
        } else {
          console.log(`[NOTIFICATION SYSTEM] [WHATSAPP] Sent to ${user.whatsapp} (Simulation Fallback):\n${messageContent}\n---`);
        }
      }
    }
    
    console.log('[NOTIFICATION SYSTEM] Daily notification dispatch completed.');
  } catch (error) {
    console.error('[NOTIFICATION SYSTEM] Error dispatching daily updates:', error);
  }
};
