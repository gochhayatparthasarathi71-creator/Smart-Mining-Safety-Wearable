const Miner = require('../models/Miner');
const SensorData = require('../models/SensorData');
const { evaluateReading } = require('./alertEngine');

/**
 * SIMULATION ENGINE
 * -----------------
 * In the real deployment, each Smart Safety Belt (ESP32 + MQ-2/MQ-7 gas
 * sensors + MPU6050 accelerometer for fall detection + MAX30100 heart-rate
 * sensor + NEO-6M GPS module) pushes a JSON payload to
 * POST /api/sensors/ingest every few seconds (see /hardware firmware).
 *
 * Since live hardware isn't wired to this demo instance yet, this module
 * generates statistically realistic readings on the same schedule and
 * feeds them through the exact same ingest pipeline (alertEngine +
 * socket broadcast) — so the dashboard behaves identically to production.
 * Swap SIMULATION_ENABLED=false in .env the moment real belts are online.
 */

let intervalHandle = null;

// Mine zones with rough surface coordinates (for the map view)
const ZONES = [
  { zone: 'Zone A - Main Shaft', lat: 21.2514, lng: 81.6296, depth: 180 },
  { zone: 'Zone B - Coal Face 2', lat: 21.2531, lng: 81.6321, depth: 240 },
  { zone: 'Zone C - Ventilation Duct', lat: 21.2498, lng: 81.6278, depth: 150 },
  { zone: 'Zone D - Haulage Tunnel', lat: 21.2542, lng: 81.6259, depth: 200 },
];

function randInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function jitter(base, amount) {
  return base + randInRange(-amount, amount);
}

/**
 * Produces one realistic reading for a miner. Most readings are "normal";
 * with SIMULATION_ANOMALY_CHANCE probability, one dimension spikes into
 * warning/critical range so the demo shows the alert pipeline working live.
 */
function generateReading(miner, previousZone) {
  const anomalyChance = Number(process.env.SIMULATION_ANOMALY_CHANCE) || 0.08;
  const triggerAnomaly = Math.random() < anomalyChance;
  const anomalyType = triggerAnomaly
    ? ['CO', 'CH4', 'O2', 'FALL', 'HEART_RATE', 'TEMP', 'BATTERY'][Math.floor(Math.random() * 7)]
    : null;

  const zone = previousZone || ZONES[Math.floor(Math.random() * ZONES.length)];

  const reading = {
    gas: {
      co: anomalyType === 'CO' ? randInRange(55, 90) : randInRange(2, 25),
      ch4: anomalyType === 'CH4' ? randInRange(1.1, 2.0) : randInRange(0.05, 0.6),
      o2: anomalyType === 'O2' ? randInRange(15.5, 19.2) : randInRange(20.5, 21.0),
    },
    heartRate:
      anomalyType === 'HEART_RATE'
        ? Math.random() > 0.5
          ? Math.round(randInRange(160, 190))
          : Math.round(randInRange(30, 45))
        : Math.round(randInRange(65, 95)),
    bodyTemperature: anomalyType === 'TEMP' ? jitter(39.2, 0.6) : jitter(36.7, 0.4),
    fallDetected: anomalyType === 'FALL',
    posture: anomalyType === 'FALL' ? 'LYING' : Math.random() > 0.9 ? 'BENT' : 'UPRIGHT',
    batteryLevel:
      anomalyType === 'BATTERY'
        ? Math.round(randInRange(3, 14))
        : Math.round(randInRange(40, 100)),
    location: {
      lat: jitter(zone.lat, 0.0006),
      lng: jitter(zone.lng, 0.0006),
      depth: Math.round(jitter(zone.depth, 8)),
      zone: zone.zone,
    },
  };

  return reading;
}

/**
 * Runs one simulation tick across all active miners, persists readings,
 * runs them through the alert engine, and broadcasts via Socket.io.
 */
async function tick(io) {
  try {
    const miners = await Miner.find({ isActive: true });

    for (const miner of miners) {
      const lastReading = await SensorData.findOne({ miner: miner._id }).sort({ timestamp: -1 });
      const previousZone = lastReading
        ? { zone: lastReading.location.zone, lat: lastReading.location.lat, lng: lastReading.location.lng, depth: lastReading.location.depth }
        : null;

      const raw = generateReading(miner, previousZone);

      const sensorDoc = await SensorData.create({
        miner: miner._id,
        beltId: miner.beltId,
        ...raw,
      });

      const { alerts, status } = await evaluateReading(miner, raw);

      const payload = {
        miner: {
          _id: miner._id,
          name: miner.name,
          employeeId: miner.employeeId,
          beltId: miner.beltId,
          zone: miner.zone,
          status,
        },
        reading: sensorDoc,
      };

      io.emit('sensor:update', payload);

      if (alerts.length > 0) {
        alerts.forEach((alert) => io.emit('alert:new', alert));
      }
    }
  } catch (err) {
    console.error('Simulator tick error:', err.message);
  }
}

function startSimulation(io) {
  const enabled = process.env.SIMULATION_ENABLED !== 'false';
  if (!enabled) {
    console.log('⏸  Sensor simulation disabled (SIMULATION_ENABLED=false). Waiting for real hardware POSTs.');
    return;
  }
  const interval = Number(process.env.SIMULATION_INTERVAL_MS) || 3000;
  console.log(`▶️  Sensor simulation started — generating live readings every ${interval}ms`);
  intervalHandle = setInterval(() => tick(io), interval);
}

function stopSimulation() {
  if (intervalHandle) clearInterval(intervalHandle);
}

module.exports = { startSimulation, stopSimulation, generateReading, ZONES };
