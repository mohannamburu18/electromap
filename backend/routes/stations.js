const router = require('express').Router();
const Station = require('../models/Station');
const { auth, adminOnly } = require('../middleware/auth');
const { haversineKm } = require('../utils/geo');

/** List stations with optional filters */
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 50, type, maxPrice, minPower } = req.query;
    let stations = await Station.find({});
    if (lat && lng) {
      const latN = Number(lat), lngN = Number(lng), radiusN = Number(radius);
      stations = stations
        .map((s) => {
          const d = haversineKm(latN, lngN, s.location.coordinates[1], s.location.coordinates[0]);
          return { ...s.toObject(), distanceKm: Math.round(d * 10) / 10 };
        })
        .filter((s) => s.distanceKm <= radiusN)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }
    if (type) stations = stations.filter((s) => s.chargers.some((c) => c.type === type));
    if (maxPrice) stations = stations.filter((s) => s.chargers.some((c) => c.pricePerKwh <= +maxPrice));
    if (minPower) stations = stations.filter((s) => s.chargers.some((c) => c.powerKw >= +minPower));
    res.json({ stations });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** Single station */
router.get('/:id', async (req, res) => {
  try {
    const s = await Station.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json({ station: s });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** Admin: create */
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const s = await Station.create(req.body);
    res.json({ station: s });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** Admin: update */
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const s = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ station: s });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** Admin: delete */
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Station.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** Simulate live charger status change — used by socket emitter + admin panel */
router.patch('/:id/chargers/:chargerId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const s = await Station.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    const c = s.chargers.id(req.params.chargerId);
    if (!c) return res.status(404).json({ error: 'Charger not found' });
    c.status = status;
    await s.save();
    req.app.get('io').emit('charger:update', {
      stationId: s._id, chargerId: c._id, status
    });
    res.json({ station: s });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
