# ⛏️ Smart Mining Safety Belt

**A real-time IoT safety monitoring system that protects underground miners
by tracking vital signs, hazardous gas levels, falls, and location — and
instantly alerting the control room the moment something goes wrong.**

---

## 🚨 The Problem

Underground mining is one of the most hazardous occupations in the world.
Workers face constant risk from:
- **Toxic/explosive gases** — Carbon Monoxide, Methane build-up, Oxygen depletion
- **Falls and impacts** in low-visibility, uneven terrain
- **Medical emergencies** that go unnoticed until it's too late
- **Communication blackouts** — no way to call for help from deep underground
- **Delayed emergency response** due to lack of real-time location tracking

Traditional safety checks are periodic and manual. By the time a supervisor
notices something is wrong, it can already be a life-threatening situation.

## 💡 Our Solution

The **Smart Mining Safety Belt** is a wearable IoT device embedded with a
full sensor suite (gas, heart rate, fall detection, GPS, temperature) that
streams live vitals to a control-room dashboard every few seconds. A smart
alert engine continuously evaluates every reading against safety thresholds
and instantly notifies supervisors — with severity level, exact miner, and
location — the moment a danger is detected. A manual SOS button on the belt
lets a miner trigger an emergency alert instantly, even before symptoms are
measurable.

## ✨ Key Features

| Feature | Description |
|---|---|
| 🫁 **Gas Monitoring** | Live CO, CH4, and O2 readings per miner with configurable danger thresholds |
| ❤️ **Vital Signs** | Real-time heart rate and body temperature tracking |
| 🤕 **Fall Detection** | Accelerometer-based impact/fall detection |
| 📍 **Live Location** | GPS-based zone and depth tracking on a mine map |
| 🆘 **SOS Panic Button** | One-tap manual emergency alert from the belt |
| 🔋 **Battery Monitoring** | Low-battery warnings so belts never go dark unexpectedly |
| 📊 **Live Dashboard** | Real-time control-room view of every active miner, color-coded by status |
| 🔔 **Smart Alerts** | Automatic severity-ranked alerts (LOW → CRITICAL) with full history & resolution tracking |
| ⚡ **Real-Time Everything** | Powered by Socket.io — no page refresh, ever |
| 🔌 **Hardware-Ready** | Complete ESP32 firmware included — plug in real sensors, zero backend changes needed |

---

## 🏗️ Architecture

```
                    ┌─────────────────────────┐
                    │   Smart Safety Belt      │
                    │  (ESP32 + Sensor Suite)  │
                    │  Gas / HR / Fall / GPS   │
                    └────────────┬─────────────┘
                                 │ HTTPS POST (JSON)
                                 ▼
                    ┌─────────────────────────┐
                    │   Backend (Node/Express) │
                    │  ─ REST API               │
                    │  ─ Alert Engine (rules)   │
                    │  ─ Socket.io broadcaster  │
                    │  ─ Sensor Simulator*      │
                    └──────┬───────────┬───────┘
                           │           │
                     MongoDB      Socket.io
                    (persist)     (real-time)
                           │           │
                           ▼           ▼
                    ┌─────────────────────────┐
                    │  Frontend (React + Vite) │
                    │  ─ Live Dashboard         │
                    │  ─ Miner Detail + Charts  │
                    │  ─ Alert Log              │
                    └─────────────────────────┘
```
*The Sensor Simulator generates realistic live data through the exact same
alert pipeline as real hardware, so the whole system can be demoed instantly
without physical belts wired up.

### Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Recharts, Socket.io-client, Axios, Lucide icons
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, JWT auth, bcrypt
- **Hardware (bonus):** ESP32, MQ-7/MQ-4/O2 gas sensors, MPU6050, MAX30100, NEO-6M GPS

---

## 📁 Project Structure

```
smart-mining-safety-belt/
├── backend/                   # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/            # DB connection, threshold constants
│   │   ├── models/            # Miner, SensorData, Alert, User schemas
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # Express routers
│   │   ├── services/          # Alert engine + sensor simulator (the "brain")
│   │   ├── middleware/        # JWT auth, error handler
│   │   ├── sockets/           # Socket.io event wiring
│   │   ├── seed/              # Demo data seeder
│   │   └── server.js          # App entry point
│   ├── .env.example
│   └── package.json
├── frontend/                   # React + Vite dashboard
│   ├── src/
│   │   ├── components/        # Layout, MinerCard, StatCard, AlertToast
│   │   ├── pages/              # Login, Dashboard, MinerDetail, AlertsPage
│   │   ├── context/             # Auth context
│   │   ├── services/            # API client + Socket.io client
│   │   └── App.jsx / main.jsx
│   ├── .env.example
│   └── package.json
├── hardware/                    # Bonus: ESP32 firmware + wiring guide
│   ├── esp32_safety_belt/esp32_safety_belt.ino
│   └── README.md
└── docs/
    └── PITCH.md                 # Hackathon pitch deck outline
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`) **or** a free MongoDB Atlas cluster
- npm

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env if needed (defaults work for local MongoDB out of the box)

npm run seed      # creates 6 demo miners + admin login
npm run dev        # starts API on http://localhost:5000 with live simulation
```

You should see:
```
⛏️  Smart Mining Safety Belt API
🚀 Server running on http://localhost:5000
▶️  Sensor simulation started — generating live readings every 3000ms
```

### 2. Frontend Setup

Open a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev         # starts dashboard on http://localhost:5173
```

### 3. Log In

Open **http://localhost:5173** and log in with the seeded demo account:

```
Email:    admin@safetybelt.com
Password: Admin@123
```

You'll immediately see all 6 miners updating live every 3 seconds, with
occasional simulated anomalies triggering real alerts — exactly what the
system looks like with real belts in the field.

### 4. (Optional) Connect Real Hardware

See `hardware/README.md` for the full ESP32 firmware, wiring diagram, and
bill of materials. Set `SIMULATION_ENABLED=false` in `backend/.env` once
real belts are transmitting so simulated and live data don't mix.

---

## 🎯 Demo Script (for judges)

1. **Login** to the control room dashboard.
2. Point out the **live dashboard** — miners updating in real time, status
   badges (Safe/Warning/Critical) changing color as new readings arrive.
3. Click into a **miner's detail page** — show live heart-rate and gas
   charts streaming in real time.
4. Click **"Trigger Demo SOS"** on the dashboard — watch a critical alert
   toast appear instantly, the miner's card glow red, and the alert appear
   in the Alerts log — all within under a second, no refresh.
5. Go to the **Alerts page**, resolve an alert, show it update live.
6. Mention the **ESP32 firmware** in `/hardware` — this is real, flashable
   code for the physical belt prototype, built against the exact same API
   the dashboard already uses.

---

## 🔮 Future Scope

- SMS/WhatsApp alerts to supervisors via Twilio integration
- Machine-learning based predictive risk scoring (not just threshold rules)
- Offline-first belt firmware with LoRa mesh networking for zones with no WiFi
- Integration with mine ventilation systems to auto-trigger emergency airflow
- Multi-mine, multi-tenant support for enterprise deployment

---

## 👥 Team

Built for hackathon submission — Smart Mining Safety Belt Team.

## 📄 License

MIT — free to use, modify, and build on for educational and hackathon purposes.
