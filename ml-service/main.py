"""
ElectroMap ML Microservice
FastAPI service providing:
  - EV range prediction (linear regression trained on synthetic data)
  - A* routing between stations
  - Demand forecasting
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import math
import heapq
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI(title="ElectroMap ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# ---------- Train a simple range model on synthetic data ----------
# Features: battery_pct, capacity_kwh, mileage_km_per_kwh, speed_kmh, temp_c
rng = np.random.default_rng(42)
N = 5000
battery = rng.uniform(10, 100, N)
capacity = rng.uniform(20, 100, N)
mileage = rng.uniform(4, 8, N)
speed = rng.uniform(30, 120, N)
temp = rng.uniform(-5, 45, N)

# Synthetic target using physics-ish relationship + noise
speed_factor = np.where(speed > 100, 0.78, np.where(speed > 80, 0.88, np.where(speed > 50, 1.0, 0.92)))
temp_factor = np.where(temp < 5, 0.82, np.where(temp > 40, 0.9, 1.0))
y = (battery / 100) * capacity * mileage * speed_factor * temp_factor + rng.normal(0, 3, N)

X = np.column_stack([battery, capacity, mileage, speed, temp])
model = LinearRegression().fit(X, y)


class RangeInput(BaseModel):
    batteryPct: float = 80
    capacityKwh: float = 40
    mileageKmPerKwh: float = 6
    speedKmh: float = 60
    tempC: float = 25
    distanceKm: Optional[float] = None


@app.post("/predict/range")
def predict_range(inp: RangeInput):
    x = np.array([[inp.batteryPct, inp.capacityKwh, inp.mileageKmPerKwh, inp.speedKmh, inp.tempC]])
    pred = float(model.predict(x)[0])
    pred = round(max(pred, 0), 1)
    can_reach = None if inp.distanceKm is None else pred >= inp.distanceKm
    return {"rangeKm": pred, "canReach": can_reach, "model": "LinearRegression"}


# ---------- A* routing ----------
class LatLng(BaseModel):
    lat: float
    lng: float
    id: Optional[str] = None
    name: Optional[str] = None


class RouteInput(BaseModel):
    origin: LatLng
    destination: LatLng
    stations: List[LatLng] = []
    maxHopKm: float = 150


def haversine(a: LatLng, b: LatLng) -> float:
    R = 6371
    dLat = math.radians(b.lat - a.lat)
    dLon = math.radians(b.lng - a.lng)
    s = (math.sin(dLat / 2) ** 2 +
         math.cos(math.radians(a.lat)) * math.cos(math.radians(b.lat)) * math.sin(dLon / 2) ** 2)
    return 2 * R * math.asin(math.sqrt(s))


@app.post("/route/astar")
def astar_route(inp: RouteInput):
    nodes = {"ORIGIN": inp.origin, "DEST": inp.destination}
    for i, s in enumerate(inp.stations):
        nodes[s.id or f"S{i}"] = s

    open_set = [(0, "ORIGIN")]
    came_from = {}
    g = {k: math.inf for k in nodes}
    g["ORIGIN"] = 0
    dest = inp.destination

    while open_set:
        _, current = heapq.heappop(open_set)
        if current == "DEST":
            break
        cur_node = nodes[current]
        for nid, nnode in nodes.items():
            if nid == current:
                continue
            d = haversine(cur_node, nnode)
            if d > inp.maxHopKm:
                continue
            tentative = g[current] + d
            if tentative < g[nid]:
                came_from[nid] = current
                g[nid] = tentative
                f = tentative + haversine(nnode, dest)
                heapq.heappush(open_set, (f, nid))

    # reconstruct
    path = []
    cur = "DEST"
    if cur in came_from or cur == "ORIGIN":
        while cur in came_from:
            path.insert(0, {"id": cur, **nodes[cur].dict()})
            cur = came_from[cur]
        path.insert(0, {"id": "ORIGIN", **nodes["ORIGIN"].dict()})
    return {"path": path, "totalDistanceKm": round(g["DEST"], 2) if g["DEST"] != math.inf else None}


# ---------- Demand forecast ----------
@app.get("/forecast/demand")
def demand():
    curve = [20, 15, 10, 8, 8, 12, 25, 45, 60, 55, 50, 55,
             58, 55, 50, 55, 65, 85, 95, 88, 75, 60, 45, 30]
    return {"curve": [{"hour": h, "demand": v} for h, v in enumerate(curve)]}


@app.get("/")
def root():
    return {"ok": True, "service": "ElectroMap ML", "version": "1.0.0"}
