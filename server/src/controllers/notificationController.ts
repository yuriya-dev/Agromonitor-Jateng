import { Request, Response } from 'express';
import axios from 'axios';

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

    res.status(200).json({ success: true, message: "Notifikasi Telegram berhasil dikirim!" });
  } catch (error: any) {
    console.error("Error sending Telegram alert:", error.message);
    res.status(500).json({ success: false, message: "Gagal mengirim notifikasi Telegram" });
  }
};
