const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  chargerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  estimatedKwh: Number,
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  paymentId: String
}, { timestamps: true });

// Prevent double-booking same charger overlapping window
BookingSchema.index({ chargerId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
