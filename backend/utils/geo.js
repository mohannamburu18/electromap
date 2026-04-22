/**
 * Geo + AI helpers
 * - Haversine distance
 * - Dijkstra for routing with charging stops
 * - EV range predictor (simple regression)
 * - Peak-hour / demand predictor
 */

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Predict remaining range (km) for an EV.
 * Simple linear model: range = (battery% / 100) * capacity * mileage * speedFactor * tempFactor
 */
function predictRange({ batteryPct = 80, capacityKwh = 40, mileageKmPerKwh = 6, speedKmh = 60, tempC = 25 }) {
  const speedFactor = speedKmh > 100 ? 0.78 : speedKmh > 80 ? 0.88 : speedKmh > 50 ? 1.0 : 0.92;
  const tempFactor = tempC < 5 ? 0.82 : tempC > 40 ? 0.9 : 1.0;
  const usable = (batteryPct / 100) * capacityKwh;
  const range = usable * mileageKmPerKwh * speedFactor * tempFactor;
  return Math.round(range * 10) / 10;
}

/**
 * Dijkstra on a graph of stations where nodes include origin & destination.
 * Edges exist between nodes if distance <= maxHopKm (vehicle's reachable range).
 */
function dijkstraRoute({ origin, destination, stations, maxHopKm = 150 }) {
  const nodes = [
    { id: 'ORIGIN', lat: origin.lat, lng: origin.lng, name: 'Origin' },
    ...stations.map((s) => ({
      id: String(s._id || s.id),
      lat: s.location.coordinates[1],
      lng: s.location.coordinates[0],
      name: s.name,
      station: s
    })),
    { id: 'DEST', lat: destination.lat, lng: destination.lng, name: 'Destination' }
  ];

  const dist = {};
  const prev = {};
  const visited = new Set();
  nodes.forEach((n) => { dist[n.id] = Infinity; });
  dist['ORIGIN'] = 0;

  while (visited.size < nodes.length) {
    let u = null;
    let best = Infinity;
    for (const n of nodes) {
      if (!visited.has(n.id) && dist[n.id] < best) { best = dist[n.id]; u = n; }
    }
    if (!u) break;
    visited.add(u.id);
    if (u.id === 'DEST') break;
    for (const v of nodes) {
      if (visited.has(v.id)) continue;
      const d = haversineKm(u.lat, u.lng, v.lat, v.lng);
      if (d > maxHopKm) continue;
      const alt = dist[u.id] + d;
      if (alt < dist[v.id]) { dist[v.id] = alt; prev[v.id] = u.id; }
    }
  }

  // Reconstruct path
  const path = [];
  let cur = 'DEST';
  while (cur && prev[cur] !== undefined) {
    const node = nodes.find((n) => n.id === cur);
    path.unshift(node);
    cur = prev[cur];
  }
  if (path.length) {
    const originNode = nodes.find((n) => n.id === 'ORIGIN');
    path.unshift(originNode);
  }
  return { path, totalDistanceKm: Math.round((dist['DEST'] || 0) * 10) / 10 };
}

/** Simple demand predictor: morning/evening peaks */
function predictDemand(hour) {
  const curve = [
    20, 15, 10, 8, 8, 12, 25, 45, 60, 55, 50, 55,    // 0..11
    58, 55, 50, 55, 65, 85, 95, 88, 75, 60, 45, 30   // 12..23
  ];
  return curve[hour] ?? 40;
}

module.exports = { haversineKm, predictRange, dijkstraRoute, predictDemand };
