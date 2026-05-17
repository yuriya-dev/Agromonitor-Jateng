"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTelegramAlert = void 0;
const axios_1 = __importDefault(require("axios"));
// POST /api/notifications/telegram
const sendTelegramAlert = async (req, res) => {
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
        await axios_1.default.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown"
        });
        res.status(200).json({ success: true, message: "Notifikasi Telegram berhasil dikirim!" });
    }
    catch (error) {
        console.error("Error sending Telegram alert:", error.message);
        res.status(500).json({ success: false, message: "Gagal mengirim notifikasi Telegram" });
    }
};
exports.sendTelegramAlert = sendTelegramAlert;
//# sourceMappingURL=notificationController.js.map