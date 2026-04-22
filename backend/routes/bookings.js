const router = require('express').Router();
const Booking = require('../models/Booking');
const Station = require('../models/Station');
const { auth, adminOnly } = require('../middleware/auth');

/** Create booking (with double-book prevention) */
router.post('/', auth, async (req, res) => {
  try {
    const { stationId, chargerId, startTime, endTime, estimatedKwh } = req.body;
    const station = await Station.findById(stationId);
    if (!station) return res.status(404).json({ error: 'Station not found' });
    const charger = station.chargers.id(chargerId);
    if (!charger) return res.status(404).json({ error: 'Charger not found' });

    // Overlap check
    const conflict = await Booking.findOne({
      chargerId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } }
      ]
    });
    if (conflict) return res.status(409).json({ error: 'Slot already booked' });

    const totalAmount = (estimatedKwh || 10) * charger.pricePerKwh;
    const booking = await Booking.create({
      user: req.user._id,
      station: stationId,
      chargerId,
      startTime, endTime,
      estimatedKwh: estimatedKwh || 10,
      totalAmount,
      status: 'pending'
    });

    req.app.get('io').emit('booking:new', { stationId, chargerId });
    res.json({ booking });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** My bookings */
router.get('/me', auth, async (req, res) => {
  const list = await Booking.find({ user: req.user._id })
    .populate('station', 'name city address imageUrl')
    .sort('-createdAt');
  res.json({ bookings: list });
});

/** Cancel */
router.patch('/:id/cancel', auth, async (req, res) => {
  const b = await Booking.findById(req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  if (String(b.user) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
  b.status = 'cancelled';
  await b.save();
  res.json({ booking: b });
});

/** Admin list all */
router.get('/', auth, adminOnly, async (req, res) => {
  const list = await Booking.find({})
    .populate('user', 'name email')
    .populate('station', 'name city')
    .sort('-createdAt');
  res.json({ bookings: list });
});

module.exports = router;
