const router = require('express').Router();
const { auth } = require('../middleware/auth');
const Review = require('../models/Review');
const Station = require('../models/Station');

/** List reviews for a station */
router.get('/station/:stationId', async (req, res) => {
  const list = await Review.find({ station: req.params.stationId })
    .populate('user', 'name')
    .sort('-createdAt');
  res.json({ reviews: list });
});

/** Add review */
router.post('/', auth, async (req, res) => {
  const { stationId, rating, comment, images } = req.body;
  const r = await Review.create({
    user: req.user._id, station: stationId, rating, comment, images: images || []
  });

  // Recompute station rating
  const all = await Review.find({ station: stationId });
  const avg = all.reduce((s, x) => s + x.rating, 0) / all.length;
  await Station.findByIdAndUpdate(stationId, {
    rating: Math.round(avg * 10) / 10, totalReviews: all.length
  });
  res.json({ review: r });
});

module.exports = router;
