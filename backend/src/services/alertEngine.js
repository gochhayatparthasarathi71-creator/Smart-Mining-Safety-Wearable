const Alert = require('../models/Alert');
const Miner = require('../models/Miner');
const THRESHOLDS = require('../config/thresholds');

/**
 * Evaluates a fresh sensor reading against safety thresholds.
 * Creates Alert documents for any breached condition, updates the
 * miner's overall status (SAFE / WARNING / CRITICAL), and returns
 * the list of newly created alerts + the computed status so the
 * caller (simulator / socket layer) can broadcast them in real time.
 */
async function evaluateReading(miner, reading) {
  const newAlerts = [];
  let worstSeverityRank = 0; // 0 SAFE, 1 WARNING(medium), 2 CRITICAL
  const rank = { LOW: 1, MEDIUM: 1, HIGH: 2, CRITICAL: 2 };

  const pushAlert = (type, severity, message, value) => {
    newAlerts.push({
      miner: miner._id,
      beltId: miner.beltId,
      type,
      severity,
      message,
      value,
      location: reading.location,
    });
    worstSeverityRank = Math.max(worstSeverityRank, rank[severity] || 0);
  };

  // --- Gas checks ---
  if (reading.gas.co >= THRESHOLDS.CO_PPM) {
    pushAlert(
      'GAS_CO',
      reading.gas.co >= THRESHOLDS.CO_PPM * 1.5 ? 'CRITICAL' : 'HIGH',
      `High Carbon Monoxide detected: ${reading.gas.co.toFixed(1)} ppm (limit ${THRESHOLDS.CO_PPM} ppm)`,
      reading.gas.co
    );
  }
  if (reading.gas.ch4 >= THRESHOLDS.CH4_PERCENT) {
    pushAlert(
      'GAS_CH4',
      reading.gas.ch4 >= THRESHOLDS.CH4_PERCENT * 1.5 ? 'CRITICAL' : 'HIGH',
      `High Methane concentration detected: ${reading.gas.ch4.toFixed(2)}% LEL (limit ${THRESHOLDS.CH4_PERCENT}%)`,
      reading.gas.ch4
    );
  }
  if (reading.gas.o2 <= THRESHOLDS.O2_MIN_PERCENT) {
    pushAlert(
      'GAS_O2_LOW',
      reading.gas.o2 <= THRESHOLDS.O2_MIN_PERCENT - 2 ? 'CRITICAL' : 'HIGH',
      `Low Oxygen level detected: ${reading.gas.o2.toFixed(1)}% (minimum safe ${THRESHOLDS.O2_MIN_PERCENT}%)`,
      reading.gas.o2
    );
  }

  // --- Fall detection ---
  if (reading.fallDetected) {
    pushAlert(
      'FALL_DETECTED',
      'CRITICAL',
      `Fall / impact detected on belt ${miner.beltId}. Immediate check required.`,
      true
    );
  }

  // --- Heart rate ---
  if (
    reading.heartRate < THRESHOLDS.HEART_RATE_MIN ||
    reading.heartRate > THRESHOLDS.HEART_RATE_MAX
  ) {
    pushAlert(
      'HEART_RATE_ABNORMAL',
      reading.heartRate < THRESHOLDS.HEART_RATE_MIN - 15 || reading.heartRate > THRESHOLDS.HEART_RATE_MAX + 20
        ? 'CRITICAL'
        : 'HIGH',
      `Abnormal heart rate: ${reading.heartRate} bpm (safe range ${THRESHOLDS.HEART_RATE_MIN}-${THRESHOLDS.HEART_RATE_MAX} bpm)`,
      reading.heartRate
    );
  }

  // --- Body temperature ---
  if (reading.bodyTemperature >= THRESHOLDS.BODY_TEMP_MAX) {
    pushAlert(
      'BODY_TEMP_HIGH',
      'MEDIUM',
      `Elevated body temperature: ${reading.bodyTemperature.toFixed(1)}°C (limit ${THRESHOLDS.BODY_TEMP_MAX}°C)`,
      reading.bodyTemperature
    );
  }

  // --- Battery ---
  if (reading.batteryLevel <= THRESHOLDS.BATTERY_LOW) {
    pushAlert(
      'BATTERY_LOW',
      'LOW',
      `Belt battery low: ${reading.batteryLevel}% remaining`,
      reading.batteryLevel
    );
  }

  // Persist alerts
  let savedAlerts = [];
  if (newAlerts.length > 0) {
    savedAlerts = await Alert.insertMany(newAlerts);
  }

  // Determine overall miner status
  const status = worstSeverityRank === 2 ? 'CRITICAL' : worstSeverityRank === 1 ? 'WARNING' : 'SAFE';
  if (miner.status !== status) {
    miner.status = status;
    await miner.save();
  }

  return { alerts: savedAlerts, status };
}

/**
 * Raises a manual SOS alert triggered by the miner (panic button on the belt).
 */
async function raiseSOS(miner, location) {
  const alert = await Alert.create({
    miner: miner._id,
    beltId: miner.beltId,
    type: 'SOS_MANUAL',
    severity: 'CRITICAL',
    message: `🚨 SOS button pressed by ${miner.name} (Belt ${miner.beltId})! Immediate assistance required.`,
    value: true,
    location,
  });

  miner.status = 'CRITICAL';
  await miner.save();

  return alert;
}

module.exports = { evaluateReading, raiseSOS };
