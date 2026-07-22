const Miner = require('../models/Miner');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const { evaluateReading, raiseSOS } = require('../services/alertEngine');

// @desc   Ingest a real sensor reading from a physical belt (ESP32 firmware)
// @route  POST /api/sensors/ingest
// @body   { beltId, gas: {co, ch4, o2}, heartRate, bodyTemperature, fallDetected, batteryLevel, location }
exports.ingestReading = async (req, res) => {
  try {
    const { beltId } = req.body;
    if (!beltId) return res.status(400).json({ success: false, message: 'beltId is required' });

    const miner = await Miner.findOne({ beltId });
    if (!miner) return res.status(404).json({ success: false, message: `No miner registered for belt ${beltId}` });

    const reading = {
      gas: req.body.gas || { co: 0, ch4: 0, o2: 20.9 },
      heartRate: req.body.heartRate ?? 75,
      bodyTemperature: req.body.bodyTemperature ?? 36.6,
      fallDetected: !!req.body.fallDetected,
      posture: req.body.posture || 'UPRIGHT',
      batteryLevel: req.body.batteryLevel ?? 100,
      location: req.body.location || { lat: 0, lng: 0, depth: 0, zone: miner.zone },
    };

    const sensorDoc = await SensorData.create({ miner: miner._id, beltId, ...reading });
    const { alerts, status } = await evaluateReading(miner, reading);

    const io = req.app.get('io');
    if (io) {
      io.emit('sensor:update', {
        miner: { _id: miner._id, name: miner.name, employeeId: miner.employeeId, beltId, zone: miner.zone, status },
        reading: sensorDoc,
      });
      alerts.forEach((alert) => io.emit('alert:new', alert));
    }

    res.status(201).json({ success: true, data: sensorDoc, alertsRaised: alerts.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Manual SOS trigger (panic button on belt, or dashboard test button)
// @route  POST /api/sensors/sos
// @body   { beltId, location }
exports.triggerSOS = async (req, res) => {
  try {
    const { beltId, location } = req.body;
    const miner = await Miner.findOne({ beltId });
    if (!miner) return res.status(404).json({ success: false, message: `No miner registered for belt ${beltId}` });

    const alert = await raiseSOS(miner, location);

    const io = req.app.get('io');
    if (io) {
      io.emit('alert:new', alert);
      io.emit('sos:triggered', { miner, alert });
    }

    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get recent readings for a belt (for charts)
// @route  GET /api/sensors/:minerId/history?limit=50
exports.getHistory = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const history = await SensorData.find({ miner: req.params.minerId })
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json({ success: true, data: history.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
