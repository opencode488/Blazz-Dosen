import axios from 'axios';

// Directly call /api/whatsapp using standard axios
const waApi = axios.create({
  baseURL: '/api/whatsapp',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const whatsappService = {
  // Ambil status koneksi WhatsApp & barcode QR saat ini
  getStatus: async () => {
    try {
      const res = await waApi.get('/status');
      return res.data;
    } catch (err) {
      console.warn('Gagal mengambil status WhatsApp:', err.message);
      return {
        status: 'disconnected',
        qrCode: null,
        user: null,
        isConnected: false,
        error: err.message
      };
    }
  },

  // Mulai inisialisasi / minta barcode QR baru
  connect: async (forceFresh = false) => {
    try {
      const res = await waApi.post('/connect', { forceFresh });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Gagal memulai koneksi WhatsApp.');
    }
  },

  // Putuskan koneksi / logout dari WhatsApp
  disconnect: async () => {
    try {
      const res = await waApi.post('/disconnect');
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Gagal memutuskan WhatsApp.');
    }
  },

  // Kirim pesan WhatsApp
  sendMessage: async ({ to, phone, message }) => {
    const target = to || phone;
    try {
      const res = await waApi.post('/send', { to: target, message });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Gagal mengirim pesan WhatsApp.';
      throw new Error(message);
    }
  }
};

export default whatsappService;
