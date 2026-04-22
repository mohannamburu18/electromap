const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Station = require('../models/Station');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const { predictDemand } = require('../utils/geo');

router.get('/stats', auth, adminOnly, async (_req, res) => {
  const [users, stations, bookings, txs] = await Promise.all([
    User.countDocuments({}), Station.countDocuments({}),
    Booking.countDocuments({}), Transaction.find({ status: 'success' })
  ]);
  const revenue = txs.reduce((s, t) => s + (t.amount || 0), 0);
  const last7 = await Booking.find({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });
  // Daily bookings bucket
  const daily = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const count = last7.filter((b) => b.createdAt.toISOString().slice(0, 10) === key).length;
    return { date: key, count };
  });
  const peak = Array.from({ length: 24 }, (_, h) => ({ hour: h, demand: predictDemand(h) }));
  res.json({ users, stations, bookings, revenue, daily, peak });
});

router.get('/users', auth, adminOnly, async (_req, res) => {
  const users = await User.find({}).select('-password');
  res.json({ users });
});

module.exports = router;
