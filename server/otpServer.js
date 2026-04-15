import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.OTP_SERVER_PORT || 5000);
const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

const emailTransport = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS ?
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }) : null;

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN ?
  twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

function createRequestId() {
  return crypto.randomUUID();
}

function createOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getOtpRecord(requestId) {
  const record = otpStore.get(requestId);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(requestId);
    return null;
  }
  return record;
}

app.post('/otp/send', async (req, res) => {
  const { channel, value, whatsappLinked = false } = req.body;

  if (!['email', 'phone'].includes(channel)) {
    return res.status(400).json({ error: 'channel must be email or phone' });
  }

  if (!value || typeof value !== 'string') {
    return res.status(400).json({ error: 'value is required' });
  }

  const otp = createOtp();
  const requestId = createRequestId();
  const record = {
    channel,
    value,
    code: otp,
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_TTL_MS,
  };

  otpStore.set(requestId, record);

  if (channel === 'email') {
    if (emailTransport) {
      try {
        await emailTransport.sendMail({
          from: process.env.EMAIL_FROM || process.env.SMTP_USER,
          to: value,
          subject: 'Your Defynix OTP Code',
          text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
          html: `<p>Your OTP code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
        });
        return res.json({ requestId, expiresIn: 300 });
      } catch (error) {
        console.error('Email send failure:', error);
        return res.status(500).json({ error: 'Failed to send email OTP.' });
      }
    }
    return res.json({ requestId, expiresIn: 300, fallbackOtp: otp, warning: 'Email transport is not configured.' });
  }

  if (channel === 'phone') {
    if (twilioClient && process.env.TWILIO_FROM_NUMBER) {
      try {
        const destination = whatsappLinked && process.env.TWILIO_WHATSAPP_FROM
          ? `whatsapp:${value}`
          : value;
        const from = whatsappLinked && process.env.TWILIO_WHATSAPP_FROM
          ? `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`
          : process.env.TWILIO_FROM_NUMBER;

        await twilioClient.messages.create({
          body: `Your Defynix OTP code is ${otp}. It expires in 5 minutes.`,
          from,
          to: destination,
        });
        return res.json({ requestId, expiresIn: 300 });
      } catch (error) {
        console.error('Twilio SMS/WhatsApp failure:', error);
        return res.status(500).json({ error: 'Failed to send phone OTP.' });
      }
    }
    return res.json({ requestId, expiresIn: 300, fallbackOtp: otp, warning: 'Twilio SMS provider is not configured.' });
  }

  return res.status(400).json({ error: 'Unknown channel.' });
});

app.post('/otp/verify', (req, res) => {
  const { requestId, code } = req.body;
  if (!requestId || !code) {
    return res.status(400).json({ error: 'requestId and code are required.' });
  }

  const record = getOtpRecord(requestId);
  if (!record) {
    return res.status(400).json({ verified: false, message: 'OTP session expired or invalid.' });
  }

  if (record.code !== String(code).trim()) {
    return res.status(400).json({ verified: false, message: 'Incorrect OTP.' });
  }

  otpStore.delete(requestId);
  return res.json({ verified: true });
});

app.get('/', (req, res) => {
  res.send({ status: 'otp server running' });
});

app.listen(PORT, () => {
  console.log(`OTP backend listening on http://localhost:${PORT}`);
});
