/* eslint-disable */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  initWhatsApp,
  getWhatsAppStatus,
  disconnectWhatsApp,
  sendWhatsAppMessage
} from './whatsapp.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  if (req.path !== '/api/whatsapp/status') {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// WhatsApp status & QR Code endpoint
app.get('/api/whatsapp/status', (req, res) => {
  const status = getWhatsAppStatus();
  res.json(status);
});

// Connect or request QR code
app.post('/api/whatsapp/connect', async (req, res) => {
  const { forceFresh } = req.body || {};
  try {
    const status = await initWhatsApp(Boolean(forceFresh));
    res.json({
      success: true,
      message: 'Inisialisasi WhatsApp dimulai.',
      ...status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal memulai koneksi WhatsApp.'
    });
  }
});

// Disconnect / Logout
app.post('/api/whatsapp/disconnect', async (req, res) => {
  try {
    const result = await disconnectWhatsApp();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal memutuskan WhatsApp.'
    });
  }
});

// Send WhatsApp message directly
app.post('/api/whatsapp/send', async (req, res) => {
  const { to, phone, message } = req.body || {};
  const targetPhone = to || phone;

  if (!targetPhone) {
    return res.status(400).json({
      success: false,
      message: 'Parameter "to" atau "phone" diperlukan.'
    });
  }

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Parameter "message" tidak boleh kosong.'
    });
  }

  try {
    const result = await sendWhatsAppMessage(targetPhone, message);
    res.json({
      success: true,
      message: 'Pesan WhatsApp berhasil dikirim.',
      data: result
    });
  } catch (error) {
    console.error('[API Send Error]:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengirim pesan WhatsApp.'
    });
  }
});

// Generic chat send endpoint compatible with chatService.js
app.post('/api/chat/send', async (req, res) => {
  const { phone, to, message } = req.body || {};
  const target = phone || to;

  if (!target || !message) {
    return res.status(400).json({ success: false, message: 'Nomor telepon dan pesan wajib diisi.' });
  }

  try {
    const result = await sendWhatsAppMessage(target, message);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server backend.'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Dosen Chat Bot Backend Server running on port ${PORT}`);
  console.log(`📱 WhatsApp Web API: http://localhost:${PORT}/api/whatsapp/status`);
  console.log(`====================================================`);

  // Auto-initialize WhatsApp on server start so QR or existing session loads immediately
  initWhatsApp(false).catch((err) => {
    console.warn('[WhatsApp] Auto-init pada startup gagal:', err.message);
  });
});
