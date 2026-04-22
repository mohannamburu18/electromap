# Deployment Guide

## 1. MongoDB Atlas (free tier)

1. Sign up at https://cloud.mongodb.com — create a free M0 cluster
2. Database Access → Add user with password
3. Network Access → Allow `0.0.0.0/0` (or your server IP)
4. Connect → Drivers → copy URI, looks like:
   `mongodb+srv://<user>:<pass>@cluster.xxx.mongodb.net/electromap`

## 2. Backend on Render

1. Create new **Web Service** → connect your GitHub
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Environment variables (from `backend/.env.example`):
   - `MONGO_URI` — your Atlas string
   - `JWT_SECRET` — long random string
   - `CLIENT_URL` — your frontend URL (after Vercel deploy)
   - `PORT` — Render sets automatically
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — optional
6. Deploy. Note the URL, e.g. `https://electromap-api.onrender.com`

After first deploy run seed once locally targeting the Atlas URI:
```bash
cd backend
MONGO_URI="mongodb+srv://..." npm run seed
```

## 3. Frontend on Vercel

1. Import repo at vercel.com
2. Root directory: `frontend`
3. Framework: Vite
4. Environment variables:
   - `VITE_API_URL=https://electromap-api.onrender.com`
   - `VITE_SOCKET_URL=https://electromap-api.onrender.com`
5. Deploy.

## 4. ML Service on Render (optional)

1. New Web Service → root `ml-service`
2. Runtime: Python 3.11
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 5. Post-deploy checklist

- [ ] Backend returns `{ok:true}` at `/`
- [ ] Frontend loads and stations appear on map
- [ ] Socket connects (browser console shows `🔌 socket connected`)
- [ ] Login works with demo account
- [ ] Booking flow completes
- [ ] Admin dashboard loads stats

## Troubleshooting

**CORS errors** → check `CLIENT_URL` in backend matches Vercel URL exactly (no trailing slash).
**Socket disconnects** → ensure Render plan supports long-running connections.
**Render spin-down** → free tier sleeps after 15min; first request takes ~50s.
**Map tiles blank** → OpenStreetMap has no key but respects user-agent; should just work.
