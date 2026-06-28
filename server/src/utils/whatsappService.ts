import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
// @ts-ignore
import qrcodeTerminal from 'qrcode-terminal';

export type WhatsAppStatus = 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'CONNECTED' | 'ERROR';

class WhatsAppService {
  private client: Client | null = null;
  private status: WhatsAppStatus = 'DISCONNECTED';
  private qrCode: string | null = null;
  private isInitializing = false;
  private lastError: string | null = null;

  public getStatus(): WhatsAppStatus {
    return this.status;
  }

  public getQRCode(): string | null {
    return this.qrCode;
  }

  public getLastError(): string | null {
    return this.lastError;
  }

  public async initialize(): Promise<void> {
    if (this.isInitializing || this.status === 'CONNECTED') {
      console.log('[WHATSAPP SERVICE] Already initializing or connected.');
      return;
    }

    this.isInitializing = true;
    this.status = 'INITIALIZING';
    this.qrCode = null;
    this.lastError = null;

    console.log('[WHATSAPP SERVICE] Starting initialization...');

    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'agromonitor-whatsapp'
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
            '--no-first-run',
            '--no-zygote',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          ]
        }
      });

      this.client.on('qr', async (qr) => {
        console.log('[WHATSAPP SERVICE] QR Code received. Generate terminal QR & image Data URL...');
        this.status = 'QR_READY';
        try {
          this.qrCode = await QRCode.toDataURL(qr);
          qrcodeTerminal.generate(qr, { small: true });
        } catch (err: any) {
          console.error('[WHATSAPP SERVICE] Failed to generate QR data URL:', err);
        }
      });

      this.client.on('ready', () => {
        console.log('[WHATSAPP SERVICE] WhatsApp Client is READY!');
        this.status = 'CONNECTED';
        this.qrCode = null;
        this.isInitializing = false;
      });

      this.client.on('authenticated', () => {
        console.log('[WHATSAPP SERVICE] WhatsApp Client authenticated successfully.');
      });

      this.client.on('auth_failure', (msg) => {
        console.error('[WHATSAPP SERVICE] WhatsApp Client auth failure:', msg);
        this.status = 'ERROR';
        this.lastError = msg;
        this.isInitializing = false;
      });

      this.client.on('disconnected', (reason) => {
        console.log('[WHATSAPP SERVICE] WhatsApp Client was disconnected:', reason);
        this.status = 'DISCONNECTED';
        this.qrCode = null;
        this.isInitializing = false;
        this.destroyClient();
      });

      await this.client.initialize();
    } catch (error: any) {
      console.error('[WHATSAPP SERVICE] Failed to boot WhatsApp Client:', error);
      this.status = 'ERROR';
      this.lastError = error.message || String(error);
      this.isInitializing = false;
      this.client = null;
    }
  }

  private async destroyClient() {
    if (this.client) {
      try {
        await this.client.destroy();
      } catch (err) {
        console.error('[WHATSAPP SERVICE] Error destroying client:', err);
      }
      this.client = null;
    }
  }

  public async disconnect(): Promise<boolean> {
    console.log('[WHATSAPP SERVICE] Disconnecting WhatsApp client...');
    try {
      await this.destroyClient();
      this.status = 'DISCONNECTED';
      this.qrCode = null;
      return true;
    } catch (err: any) {
      console.error('[WHATSAPP SERVICE] Disconnect failed:', err);
      this.lastError = err.message || String(err);
      return false;
    }
  }

  public async sendMessage(to: string, message: string): Promise<boolean> {
    console.log(`[WHATSAPP SERVICE] Attempting to send message to ${to}...`);
    
    if (this.status !== 'CONNECTED' || !this.client) {
      console.log(`[WHATSAPP SERVICE] [SIMULATION FALLBACK] WhatsApp is not connected. Logging message:\nTo: ${to}\nContent: ${message}\n---`);
      return false;
    }

    try {
      const formattedTo = this.formatPhoneNumber(to);
      await this.client.sendMessage(formattedTo, message);
      console.log(`[WHATSAPP SERVICE] Message sent successfully to ${formattedTo}.`);
      return true;
    } catch (error: any) {
      console.error(`[WHATSAPP SERVICE] Failed to send message to ${to}:`, error);
      this.lastError = error.message || String(error);
      return false;
    }
  }

  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('08')) {
      cleaned = '62' + cleaned.substring(1);
    }
    if (cleaned.startsWith('8') && cleaned.length >= 9) {
      cleaned = '62' + cleaned;
    }
    return cleaned + '@c.us';
  }
}

export const whatsappService = new WhatsAppService();
