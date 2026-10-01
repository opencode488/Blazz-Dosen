/* eslint-disable */
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState as getMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const AUTH_DIR = path.join(process.cwd(), 'whatsapp-auth');

let sock = null;
let currentQrDataUrl = null;
let connectionStatus = 'disconnected'; // 'disconnected' | 'connecting' | 'qr_ready' | 'connected'
let connectedUser = null;
let isInitializing = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const getWhatsAppStatus = () => {
  return {
    status: connectionStatus,
    qrCode: currentQrDataUrl,
    user: connectedUser,
    isConnected: connectionStatus === 'connected'
  };
};

export const initWhatsApp = async (forceFresh = false) => {
  if (isInitializing) {
    return getWhatsAppStatus();
  }

  if (connectionStatus === 'connected' && sock && !forceFresh) {
    return getWhatsAppStatus();
  }

  isInitializing = true;

  try {
    if (forceFresh) {
      if (sock) {
        try {
          sock.ev.removeAllListeners('connection.update');
          sock.ev.removeAllListeners('creds.update');
          sock.end(new Error('Force fresh connection requested'));
        } catch (_) {}
        sock = null;
      }
      if (fs.existsSync(AUTH_DIR)) {
        try {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        } catch (e) {
          console.warn('[WhatsApp] Gagal menghapus folder auth lama:', e.message);
        }
      }
      connectionStatus = 'disconnected';
      currentQrDataUrl = null;
      connectedUser = null;
      reconnectAttempts = 0;
    }

    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    connectionStatus = 'connecting';
    const { state, saveCreds } = await getMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({
      version: [2, 3000, 1015901307]
    }));

    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: true,
      auth: state,
      browser: ['Dosen Chat Bot', 'Chrome', '1.0.0'],
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      emitOwnEvents: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          currentQrDataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            scale: 8,
            color: {
              dark: '#0f172a',
              light: '#ffffff'
            }
          });
          connectionStatus = 'qr_ready';
          console.log('[WhatsApp] ✅ QR Code berhasil di-generate. Siap di-scan di website.');
        } catch (err) {
          console.error('[WhatsApp] Gagal membuat data URL QR:', err);
        }
      }

      if (connection === 'open') {
        connectionStatus = 'connected';
        currentQrDataUrl = null;
        reconnectAttempts = 0;

        const rawJid = sock.user?.id || '';
        const phone = rawJid.split(':')[0] || rawJid.split('@')[0] || '';
        connectedUser = {
          id: rawJid,
          phone,
          name: sock.user?.name || 'WhatsApp Web User'
        };

        console.log(`[WhatsApp] 🎉 Berhasil terhubung ke WhatsApp: ${phone} (${connectedUser.name})`);
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;

        console.log(`[WhatsApp] ⚠️ Koneksi ditutup (Status: ${statusCode || 'unknown'}). LoggedOut: ${isLoggedOut}`);

        if (isLoggedOut) {
          connectionStatus = 'disconnected';
          currentQrDataUrl = null;
          connectedUser = null;
          if (fs.existsSync(AUTH_DIR)) {
            try {
              fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            } catch (_) {}
          }
          console.log('[WhatsApp] Sesi telah logout. Silakan scan ulang barcode dari website.');
        } else {
          connectionStatus = 'connecting';
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            console.log(`[WhatsApp] Mencoba menghubungkan kembali (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
            setTimeout(() => {
              initWhatsApp(false);
            }, 3000);
          } else {
            console.log('[WhatsApp] Maksimal percobaan rekoneksi tercapai. Mengatur status ke disconnected.');
            connectionStatus = 'disconnected';
          }
        }
      }
    });

    isInitializing = false;
    return getWhatsAppStatus();
  } catch (error) {
    isInitializing = false;
    connectionStatus = 'disconnected';
    console.error('[WhatsApp] Gagal inisialisasi WhatsApp:', error);
    throw error;
  }
};

export const disconnectWhatsApp = async () => {
  try {
    if (sock) {
      try {
        await sock.logout();
      } catch (_) {}
      try {
        sock.ev.removeAllListeners('connection.update');
        sock.ev.removeAllListeners('creds.update');
        sock.end(undefined);
      } catch (_) {}
      sock = null;
    }

    if (fs.existsSync(AUTH_DIR)) {
      try {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      } catch (_) {}
    }

    connectionStatus = 'disconnected';
    currentQrDataUrl = null;
    connectedUser = null;
    reconnectAttempts = 0;
    console.log('[WhatsApp] Sesi WhatsApp berhasil diputuskan & folder auth dihapus.');
    return { success: true, message: 'WhatsApp berhasil diputuskan.' };
  } catch (error) {
    console.error('[WhatsApp] Error saat disconnect:', error);
    throw error;
  }
};

export const sendWhatsAppMessage = async (phoneNumber, message) => {
  if (connectionStatus !== 'connected' || !sock) {
    throw new Error('WhatsApp belum terhubung! Silakan scan barcode di website terlebih dahulu.');
  }

  if (!phoneNumber) {
    throw new Error('Nomor telepon tujuan tidak boleh kosong.');
  }

  if (!message || message.trim() === '') {
    throw new Error('Pesan tidak boleh kosong.');
  }

  // Format phone number to international 62 format
  let clean = String(phoneNumber).replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (!clean.startsWith('62')) {
    clean = '62' + clean;
  }

  const jid = `${clean}@s.whatsapp.net`;

  try {
    // Check if recipient is registered on WhatsApp
    const [exists] = await sock.onWhatsApp(jid);
    const targetJid = exists?.jid || jid;

    const result = await sock.sendMessage(targetJid, { text: message });

    console.log(`[WhatsApp] Pesan berhasil dikirim ke ${clean} (Message ID: ${result?.key?.id})`);

    return {
      success: true,
      messageId: result?.key?.id,
      to: clean,
      targetJid,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error(`[WhatsApp] Gagal mengirim pesan ke ${clean}:`, err);
    throw new Error(`Gagal mengirim WhatsApp ke ${clean}: ${err.message || 'Error tidak diketahui'}`);
  }
};
