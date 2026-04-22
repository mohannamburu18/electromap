const mongoose = require('mongoose');

const ChargerSchema = new mongoose.Schema({
  type: { type: String, enum: ['AC', 'DC', 'CCS', 'CHAdeMO', 'Type2'], required: true },
  powerKw: { type: Number, required: true },
  pricePerKwh: { type: Number, required: true },
  status: { type: String, enum: ['available', 'in-use', 'offline'], default: 'available' }
}, { _id: true });

const StationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  operator: String,
  address: String,
  city: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  chargers: [ChargerSchema],
  amenities: [String],     // e.g. ["Wifi","Cafe","Restroom"]
  open24h: { type: Boolean, default: true },
  rating: { type: Number, default: 4.2 },
  totalReviews: { type: Number, default: 0 },
  imageUrl: String
}, { timestamps: true });

StationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Station', StationSchema);
