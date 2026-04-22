/**
 * ElectroMap — Backend entrypoint
 * Express + MongoDB + Socket.io + JWT Auth
 */
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const initSocket = require('./socket');

const app = express();
const server = http.createServer(app);

/* ---------- Middleware ---------- */
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

// Basic rate limiting — 300 req / 15min per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

/* ---------- Routes ---------- */
app.get('/', (req, res) => res.json({ ok: true, service: 'ElectroMap API', version: '1.0.0' }));
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

/* ---------- Error handler ---------- */
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

/* ---------- Socket.io ---------- */
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] }
});
app.set('io', io);
initSocket(io);

/* ---------- DB + Start ---------- */
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 ElectroMap API running on :${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Mongo error:', err.message);
    console.log('ℹ️  Server starting without DB (read-only mock)...');
    server.listen(PORT, () => console.log(`🚀 ElectroMap API running on :${PORT} (no DB)`));
  });
