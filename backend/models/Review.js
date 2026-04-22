const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  images: [String]
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
