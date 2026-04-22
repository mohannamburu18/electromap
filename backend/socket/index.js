/**
 * Socket.io — real-time charger availability + traffic simulation
 * Emits periodic mock IoT events if no external feed is connected.
 */
const Station = require('../models/Station');

module.exports = function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('🔌 socket connected', socket.id);
    socket.on('subscribe:station', (stationId) => socket.join(`station:${stationId}`));
    socket.on('disconnect', () => console.log('❌ socket gone', socket.id));
  });

  // Simulate live status changes every 20s
  setInterval(async () => {
    try {
      const stations = await Station.find({}).limit(30);
      if (!stations.length) return;
      const s = stations[Math.floor(Math.random() * stations.length)];
      if (!s.chargers.length) return;
      const c = s.chargers[Math.floor(Math.random() * s.chargers.length)];
      const states = ['available', 'in-use', 'available', 'available', 'offline'];
      c.status = states[Math.floor(Math.random() * states.length)];
      await s.save();
      io.emit('charger:update', {
        stationId: s._id, chargerId: c._id, status: c.status
      });
    } catch (_) { /* db not ready */ }
  }, 20000);

  // Simulate traffic pulse every 10s
  setInterval(() => {
    io.emit('traffic:update', {
      timestamp: Date.now(),
      level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    });
  }, 10000);
};
