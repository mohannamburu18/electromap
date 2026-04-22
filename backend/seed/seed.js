/**
 * Seed script — populates stations + an admin/user for local dev.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Station = require('../models/Station');
const User = require('../models/User');

const STATIONS = [
  { name: 'Volt Hub Jubilee Hills', operator: 'Tata Power', address: 'Road No 36, Jubilee Hills', city: 'Hyderabad',
    coords: [78.4089, 17.4318], amenities: ['Cafe', 'Wifi', 'Restroom'], rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800' },
  { name: 'ChargeZone Gachibowli', operator: 'ChargeZone', address: 'ISB Road, Gachibowli', city: 'Hyderabad',
    coords: [78.3482, 17.4436], amenities: ['Wifi', 'Restroom'], rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1697320022979-3f5b251bfd69?w=800' },
  { name: 'Ather Grid Hitech City', operator: 'Ather', address: 'Hitech City Main Rd', city: 'Hyderabad',
    coords: [78.3807, 17.4435], amenities: ['Cafe', 'Lounge'], rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1621111848501-8d3634f82336?w=800' },
  { name: 'Statiq Banjara Hills', operator: 'Statiq', address: 'Road No 12, Banjara Hills', city: 'Hyderabad',
    coords: [78.4376, 17.4126], amenities: ['Restroom'], rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1679180070823-c9fdb2edcc69?w=800' },
  { name: 'Tata Power Madhapur', operator: 'Tata Power', address: 'Madhapur Rd', city: 'Hyderabad',
    coords: [78.3915, 17.4483], amenities: ['Cafe', 'Wifi'], rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1558425001-b9d6551e3f33?w=800' },
  { name: 'VoltUp Secunderabad', operator: 'VoltUp', address: 'SP Road, Secunderabad', city: 'Hyderabad',
    coords: [78.4983, 17.4399], amenities: ['Wifi'], rating: 4.1,
    imageUrl: 'https://images.unsplash.com/photo-1632823471565-1ecdf5c6da77?w=800' },
  { name: 'ChargeGrid Kondapur', operator: 'ChargeGrid', address: 'Kondapur Main Rd', city: 'Hyderabad',
    coords: [78.3654, 17.4673], amenities: ['Cafe', 'Restroom', 'Wifi'], rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=800' },
  { name: 'EV Plug Kukatpally', operator: 'EV Plug', address: 'KPHB Colony', city: 'Hyderabad',
    coords: [78.3923, 17.4948], amenities: ['Wifi'], rating: 4.0,
    imageUrl: 'https://images.unsplash.com/photo-1571988840298-3b5301d5109b?w=800' },
  { name: 'Relux Charge LB Nagar', operator: 'Relux', address: 'LB Nagar Main Rd', city: 'Hyderabad',
    coords: [78.5564, 17.3466], amenities: ['Restroom'], rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1591271299057-e39b8cb7e033?w=800' },
  { name: 'PowerUp Begumpet', operator: 'PowerUp', address: 'Begumpet Airport Rd', city: 'Hyderabad',
    coords: [78.4634, 17.4441], amenities: ['Cafe', 'Wifi'], rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800' }
];

function randomChargers() {
  const types = ['AC', 'DC', 'CCS', 'CHAdeMO', 'Type2'];
  const count = 2 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, () => {
    const type = types[Math.floor(Math.random() * types.length)];
    const isFast = ['DC', 'CCS', 'CHAdeMO'].includes(type);
    return {
      type,
      powerKw: isFast ? [50, 60, 120, 150][Math.floor(Math.random() * 4)]
                      : [7, 11, 22][Math.floor(Math.random() * 3)],
      pricePerKwh: isFast ? 18 + Math.floor(Math.random() * 8) : 10 + Math.floor(Math.random() * 6),
      status: ['available', 'available', 'in-use', 'offline'][Math.floor(Math.random() * 4)]
    };
  });
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected, seeding...');

    await Station.deleteMany({});
    const docs = STATIONS.map((s) => ({
      name: s.name, operator: s.operator, address: s.address, city: s.city,
      location: { type: 'Point', coordinates: s.coords },
      chargers: randomChargers(),
      amenities: s.amenities, rating: s.rating, totalReviews: Math.floor(Math.random() * 200) + 20,
      imageUrl: s.imageUrl
    }));
    await Station.insertMany(docs);
    console.log(`🟢 Inserted ${docs.length} stations`);

    // Admin + demo user
    await User.deleteMany({ email: { $in: ['admin@electromap.io', 'demo@electromap.io'] } });
    await User.create({ name: 'Admin', email: 'admin@electromap.io', password: 'admin123', role: 'admin' });
    await User.create({
      name: 'Demo User', email: 'demo@electromap.io', password: 'demo1234',
      vehicle: { make: 'Tata', model: 'Nexon EV', batteryCapacityKwh: 40, mileageKmPerKwh: 6, currentBatteryPct: 75 }
    });
    console.log('👤 Created admin@electromap.io / admin123  and  demo@electromap.io / demo1234');
    process.exit(0);
  } catch (e) {
    console.error('Seed error:', e.message);
    process.exit(1);
  }
})();
