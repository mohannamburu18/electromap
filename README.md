# ⚡ ElectroMap

> **Smart EV charging station finder** — real-time availability, AI routing, range prediction, booking + payments.

A full-stack production-ready platform combining a React dark-themed frontend, Node/Express backend with Socket.io, Python FastAPI ML microservice, and MongoDB.

![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node%20%7C%20MongoDB%20%7C%20FastAPI-22d3ee)

---

## ✨ Features

- 🗺️  **Live map** with real-time charger availability (Socket.io)
- 🔐  **JWT authentication** with user + admin roles
- 📅  **Booking system** with double-booking prevention
- 💳  **Razorpay payments** (works in mock mode without keys)
- 🧠  **AI features**: range prediction (scikit-learn), Dijkstra/A* smart routing, demand forecasting, smart recommendations
- 🤖  **AI chatbot** + voice input (Web Speech API)
- ⭐  **Reviews & ratings**
- 📊  **Admin dashboard** with Chart.js analytics
- 🌗  **Dark / light theme** toggle
- 📱  **PWA-ready** (manifest included)
- 🎨  **Modern UI** — glassmorphism, gradient accents, animations

---

## 📁 Project structure

```
electromap/
├── backend/           Node.js + Express API + Socket.io
├── frontend/          React + Vite + Tailwind
├── ml-service/        Python FastAPI (scikit-learn)
└── docs/              API + deployment guides
```

---

## 🚀 Quick start (local)

You need: **Node 18+**, **Python 3.10+**, and **MongoDB** (local or Atlas).

### 1. Clone / unzip and install

```bash
cd electromap

# Backend
cd backend
cp .env.example .env
# edit .env → set MONGO_URI (local: mongodb://127.0.0.1:27017/electromap) and JWT_SECRET
npm install

# Seed DB with demo stations + accounts
npm run seed

# Start backend
npm run dev
# → http://localhost:5000
```

### 2. Frontend

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
# → http://localhost:5173
```

### 3. ML service (optional)

```bash
cd ../ml-service
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000
```

> The backend already implements the AI features in JavaScript (`utils/geo.js`), so the ML service is **optional**. It's a drop-in replacement if you want scikit-learn-based predictions.

---

## 🔑 Demo accounts

After running `npm run seed`:

| Role  | Email                     | Password   |
|-------|---------------------------|------------|
| User  | demo@electromap.io        | demo1234   |
| Admin | admin@electromap.io       | admin123   |

---

## 🧭 Google Maps vs Leaflet

The frontend uses **Leaflet + OpenStreetMap** — it renders beautifully in dark mode and requires **zero configuration**. If you want Google Maps, replace `MapView.jsx` with `@react-google-maps/api` and add `VITE_GOOGLE_MAPS_KEY` to `.env`.

---

## 💳 Razorpay

The backend uses **mock payments** when Razorpay keys are missing or placeholder. To enable real test payments:
1. Get test keys at https://dashboard.razorpay.com/
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`
3. Restart backend

---

## 🧠 AI features

| Feature | Algorithm | Endpoint |
|---------|-----------|----------|
| Range prediction | Linear regression (scikit-learn) | `POST /api/ai/range` |
| Smart route | Dijkstra (Node) / A* (Python) | `POST /api/ai/route` |
| Demand forecast | Historical curve | `GET /api/ai/demand` |
| Recommendations | Weighted scoring | `POST /api/ai/recommend` |
| Chatbot | Rule-based | `POST /api/ai/chat` |

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy `dist/` — or import the repo at vercel.com
# Set env: VITE_API_URL=https://your-backend.onrender.com
```

### Backend → Render / Railway
```bash
# Build command:   npm install
# Start command:   npm start
# Add env vars from backend/.env.example
# Set CLIENT_URL to your Vercel URL
```

### MongoDB → Atlas
1. Create a free cluster at https://www.mongodb.com/atlas
2. Add your IP / 0.0.0.0/0 to network access
3. Paste the connection string into `MONGO_URI`

### ML service → Render (Web Service, Python runtime)
```bash
# Build:  pip install -r requirements.txt
# Start:  uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 📡 API overview

See `docs/API.md` for the full reference.

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/stations?lat=&lng=&type=&maxPrice=
GET    /api/stations/:id
POST   /api/bookings
GET    /api/bookings/me
POST   /api/payments/order
POST   /api/ai/route
POST   /api/ai/range
POST   /api/ai/recommend
GET    /api/admin/stats
```

---

## 🧪 Socket.io events

| Event             | Direction       | Payload                                     |
|-------------------|-----------------|---------------------------------------------|
| `charger:update`  | server → client | `{ stationId, chargerId, status }`          |
| `booking:new`     | server → client | `{ stationId, chargerId }`                  |
| `traffic:update`  | server → client | `{ timestamp, level: 'low'│'medium'│'high'}`|
| `subscribe:station` | client → server | `stationId`                               |

---

## 🔐 Security

- JWT auth with 7-day expiry
- Password hashing (bcrypt, 10 rounds)
- Role-based route protection (user/admin)
- Rate limiting (300 req / 15 min per IP)
- CORS locked to `CLIENT_URL`

---

## 🛠 Tech stack

**Frontend** — React 18, Vite, Tailwind, React Router, Leaflet, Socket.io-client, Chart.js, react-hot-toast
**Backend** — Node, Express, Mongoose, Socket.io, JWT, bcrypt, Razorpay
**ML** — FastAPI, scikit-learn, NumPy
**Database** — MongoDB

---

## 📜 License

MIT — use freely for learning or projects.

⚡ Built with care. Contributions welcome.
