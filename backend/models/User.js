const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const VehicleSchema = new mongoose.Schema({
  make: String,
  model: String,
  batteryCapacityKwh: { type: Number, default: 40 },
  mileageKmPerKwh: { type: Number, default: 6 },
  currentBatteryPct: { type: Number, default: 80 }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: String,
  vehicle: VehicleSchema,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Station' }],
  walletBalance: { type: Number, default: 0 }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};

module.exports = mongoose.model('User', UserSchema);
