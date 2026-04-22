const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  amount: Number,
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created', 'success', 'failed'], default: 'created' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  method: String
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
