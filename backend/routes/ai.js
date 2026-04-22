const router = require('express').Router();
const Station = require('../models/Station');
const { predictRange, dijkstraRoute, predictDemand, haversineKm } = require('../utils/geo');

/** Range prediction */
router.post('/range', (req, res) => {
  try {
    const result = predictRange(req.body || {});
    const { distanceKm } = req.body;
    let canReach = null;
    if (typeof distanceKm === 'number') canReach = result >= distanceKm;
    res.json({ rangeKm: result, canReach });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** Smart route with charging stops */
router.post('/route', async (req, res) => {
  try {
    const { origin, destination, maxHopKm = 150 } = req.body;
    const stations = await Station.find({});
    const result = dijkstraRoute({ origin, destination, stations, maxHopKm });
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** Demand curve for a station (24h) */
router.get('/demand', (_req, res) => {
  const curve = Array.from({ length: 24 }, (_, h) => ({ hour: h, demand: predictDemand(h) }));
  res.json({ curve });
});

/** Smart recommendations: best stations by a weighted score */
router.post('/recommend', async (req, res) => {
  try {
    const { lat, lng, limit = 5 } = req.body;
    const stations = await Station.find({});
    const scored = stations.map((s) => {
      const d = (lat && lng) ? haversineKm(lat, lng, s.location.coordinates[1], s.location.coordinates[0]) : 10;
      const avail = s.chargers.filter((c) => c.status === 'available').length;
      const cheapest = Math.min(...s.chargers.map((c) => c.pricePerKwh));
      const score =
        (s.rating * 20) +                    // quality
        (avail * 10) -                       // availability
        (d * 1.5) -                          // proximity
        (cheapest * 0.5);                    // cost
      return { station: s, score: Math.round(score * 10) / 10, distanceKm: Math.round(d * 10) / 10 };
    }).sort((a, b) => b.score - a.score).slice(0, +limit);
    res.json({ recommendations: scored });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** Simple chatbot — rule-based with smart fallbacks */
router.post('/chat', (req, res) => {
  const msg = String(req.body.message || '').toLowerCase();
  let reply = "I'm ElectroBot ⚡ — ask me about charging stations, routes, pricing, or your EV range.";
  if (msg.includes('range')) reply = "Tell me your battery %, vehicle capacity (kWh) and distance — I'll predict if you can make it.";
  else if (msg.includes('book') || msg.includes('slot')) reply = "To book: pick a station → choose a charger → select a time window. I'll handle payment via Razorpay.";
  else if (msg.includes('cheap') || msg.includes('price')) reply = "Use the price filter on the map. Most AC chargers are ₹10–15/kWh, DC fast chargers ₹18–25/kWh.";
  else if (msg.includes('fast')) reply = "Look for DC chargers with ≥50 kW — CCS and CHAdeMO are typical fast-charging standards.";
  else if (msg.includes('hello') || msg.includes('hi')) reply = "Hey there! ⚡ I'm ElectroBot. How can I help you charge smarter today?";
  res.json({ reply });
});

module.exports = router;
