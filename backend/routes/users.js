const router = require('express').Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

/** Update profile */
router.put('/me', auth, async (req, res) => {
  const { name, phone, vehicle } = req.body;
  const u = await User.findByIdAndUpdate(req.user._id,
    { ...(name && { name }), ...(phone && { phone }), ...(vehicle && { vehicle }) },
    { new: true }).select('-password');
  res.json({ user: u });
});

/** Toggle favorite */
router.post('/favorites/:stationId', auth, async (req, res) => {
  const u = await User.findById(req.user._id);
  const sid = req.params.stationId;
  const idx = u.favorites.findIndex((f) => String(f) === sid);
  if (idx >= 0) u.favorites.splice(idx, 1);
  else u.favorites.push(sid);
  await u.save();
  res.json({ favorites: u.favorites });
});

/** Get favorites populated */
router.get('/favorites', auth, async (req, res) => {
  const u = await User.findById(req.user._id).populate('favorites');
  res.json({ favorites: u.favorites });
});

module.exports = router;
