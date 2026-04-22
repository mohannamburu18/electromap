const router = require('express').Router();
const { auth } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_ID.includes('xxxxx')) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
} catch (_) { /* ignore if not configured */ }

/** Create Razorpay order (or a mock order when keys absent) */
router.post('/order', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const amountPaise = Math.round(booking.totalAmount * 100);
    let order;
    if (razorpay) {
      order = await razorpay.orders.create({
        amount: amountPaise, currency: 'INR', receipt: `rcpt_${booking._id}`
      });
    } else {
      order = { id: `order_mock_${Date.now()}`, amount: amountPaise, currency: 'INR' };
    }

    await Transaction.create({
      user: req.user._id, booking: booking._id,
      amount: booking.totalAmount, razorpayOrderId: order.id, status: 'created'
    });
    res.json({ order, keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** Confirm payment */
router.post('/verify', auth, async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId } = req.body;
    const tx = await Transaction.findOne({ razorpayOrderId });
    if (tx) {
      tx.status = 'success';
      tx.razorpayPaymentId = razorpayPaymentId;
      await tx.save();
    }
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      paymentId: razorpayPaymentId,
      status: 'confirmed'
    });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** Transaction history */
router.get('/me', auth, async (req, res) => {
  const list = await Transaction.find({ user: req.user._id }).sort('-createdAt');
  res.json({ transactions: list });
});

module.exports = router;
