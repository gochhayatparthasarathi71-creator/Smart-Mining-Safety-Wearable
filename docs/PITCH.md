# 🎤 Hackathon Pitch — Smart Mining Safety Belt

Use this as your talk track / slide outline for the judging round.

## 1. Hook (10 seconds)
> "Every year, thousands of miners are injured or killed underground —
> often because help arrived minutes too late. We built a belt that calls
> for help before a human even could."

## 2. Problem (20 seconds)
- Underground mining = toxic gas exposure, falls, medical emergencies, zero visibility
- Manual, periodic safety checks → dangerous delay between incident and response
- No real-time way to know a miner is in trouble until they don't check in

## 3. Solution (30 seconds)
- A wearable **Smart Safety Belt**: gas sensors (CO/CH4/O2), heart rate, fall
  detection, GPS, and an SOS button
- Streams live vitals to a **control-room dashboard** every few seconds
- A rules-based **alert engine** flags danger instantly, ranked by severity
- Supervisors see exactly *who*, *where*, and *what's wrong* — in real time

## 4. Live Demo (60-90 seconds)
Follow the Demo Script in the main README:
1. Live dashboard with all miners
2. Drill into one miner's live charts
3. Trigger the SOS button → watch the alert appear instantly
4. Resolve it from the Alerts log

## 5. Technical Depth (20 seconds)
- Full MERN-style stack: React + Node/Express + MongoDB + Socket.io
- Real ESP32 firmware included — not just a mockup, an actual flashable
  hardware layer using the identical API the demo uses
- Configurable safety thresholds — deployable to any mine's specific
  gas/safety regulations without code changes

## 6. Impact & Scalability (15 seconds)
- Could be deployed across an entire mine's workforce with zero per-miner
  backend changes — just flash a new belt with a unique ID
- Foundation for predictive ML risk scoring in the future
- Directly addresses a top cause of preventable mining fatalities

## 7. Close
> "This isn't just a dashboard — it's a safety net that never blinks."

---

### Anticipated Judge Questions & Answers

**Q: Is this using real sensor data or simulated?**
A: The backend includes both — a realistic simulator for demo purposes
(going through the *exact* same alert pipeline as real hardware), and
complete ESP32 firmware in `/hardware` ready to flash onto physical belts.

**Q: How do you handle no WiFi/network underground?**
A: Noted as a next step — see Future Scope (LoRa mesh networking) in the README.

**Q: How do you avoid false alarms?**
A: Thresholds are fully configurable per-mine via environment variables,
and each alert is severity-ranked so supervisors can triage rather than
being flooded by low-priority notifications.

**Q: What's the cost per belt?**
A: See the Bill of Materials in `hardware/README.md` — roughly ₹1,800-2,000
in components per unit at prototype scale.
