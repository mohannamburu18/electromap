# ElectroMap API Reference

Base URL: `http://localhost:5000/api`
Auth: `Authorization: Bearer <JWT>`

---

## Auth

### POST `/auth/register`
```json
{ "name": "Alice", "email": "alice@x.io", "password": "secret123" }
```
**200** → `{ token, user }`

### POST `/auth/login`
```json
{ "email": "alice@x.io", "password": "secret123" }
```
**200** → `{ token, user }`

### GET `/auth/me` *(auth)*
**200** → `{ user }`

---

## Stations

### GET `/stations`
Query params (all optional): `lat`, `lng`, `radius` (km, default 50), `type`, `maxPrice`, `minPower`
**200** → `{ stations: [...] }` — each with `distanceKm` if lat/lng provided.

### GET `/stations/:id` → `{ station }`

### POST `/stations` *(admin)* — create
### PUT `/stations/:id` *(admin)* — update
### DELETE `/stations/:id` *(admin)* — delete
### PATCH `/stations/:id/chargers/:chargerId` *(auth)*
Body: `{ status: 'available' | 'in-use' | 'offline' }` — also emits `charger:update` socket event.

---

## Bookings

### POST `/bookings` *(auth)*
```json
{
  "stationId": "...", "chargerId": "...",
  "startTime": "2026-04-20T10:00", "endTime": "2026-04-20T11:00",
  "estimatedKwh": 15
}
```
**200** → `{ booking }` · **409** if slot is already booked.

### GET `/bookings/me` *(auth)* → `{ bookings }`
### PATCH `/bookings/:id/cancel` *(auth)* → `{ booking }`
### GET `/bookings` *(admin)* → all bookings

---

## Payments (Razorpay)

### POST `/payments/order` *(auth)*
Body: `{ bookingId }`
**200** → `{ order: { id, amount, currency }, keyId }`

### POST `/payments/verify` *(auth)*
Body: `{ bookingId, razorpayOrderId, razorpayPaymentId }`
**200** → `{ ok: true }`

### GET `/payments/me` *(auth)* → `{ transactions }`

---

## Users

### PUT `/users/me` *(auth)*
Body: `{ name?, phone?, vehicle? }`

### POST `/users/favorites/:stationId` *(auth)* — toggle
### GET `/users/favorites` *(auth)* → populated list

---

## Reviews

### GET `/reviews/station/:stationId` → `{ reviews }`
### POST `/reviews` *(auth)*
```json
{ "stationId": "...", "rating": 5, "comment": "Fast & clean", "images": [] }
```

---

## AI

### POST `/ai/range`
```json
{ "batteryPct": 80, "capacityKwh": 40, "mileageKmPerKwh": 6, "speedKmh": 60, "tempC": 25, "distanceKm": 120 }
```
**200** → `{ rangeKm: 189.6, canReach: true }`

### POST `/ai/route`
```json
{ "origin": { "lat": 17.44, "lng": 78.38 }, "destination": { "lat": 17.38, "lng": 78.48 }, "maxHopKm": 100 }
```
**200** → `{ path: [...], totalDistanceKm: 14.3 }`

### POST `/ai/recommend`
Body: `{ lat, lng, limit }` → `{ recommendations: [...] }`

### GET `/ai/demand` → `{ curve: [{hour, demand}, …24] }`

### POST `/ai/chat`
Body: `{ message }` → `{ reply }`

---

## Admin

### GET `/admin/stats` *(admin)*
→ `{ users, stations, bookings, revenue, daily: [], peak: [] }`

### GET `/admin/users` *(admin)* → `{ users }`

---

## Socket.io events

| Event | Direction | Payload |
|-------|-----------|---------|
| `connect` | bidirectional | — |
| `subscribe:station` | → server | `stationId` |
| `charger:update` | ← server | `{ stationId, chargerId, status }` |
| `booking:new` | ← server | `{ stationId, chargerId }` |
| `traffic:update` | ← server | `{ timestamp, level }` |

---

## Error shape

```json
{ "error": "Human-readable message" }
```
Common codes: `400` validation, `401` unauth, `403` forbidden, `404` not found, `409` conflict, `500` server.
