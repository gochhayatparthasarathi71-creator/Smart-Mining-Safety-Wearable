const Miner = require('../models/Miner');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');

// @desc   Get all miners with their latest sensor reading
// @route  GET /api/miners
exports.getAllMiners = async (req, res) => {
  try {
    const miners = await Miner.find().sort({ name: 1 });

    const withReadings = await Promise.all(
      miners.map(async (miner) => {
        const latest = await SensorData.findOne({ miner: miner._id }).sort({ timestamp: -1 });
        return { ...miner.toObject(), latestReading: latest };
      })
    );

    res.json({ success: true, count: withReadings.length, data: withReadings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single miner + reading history + alerts
// @route  GET /api/miners/:id
exports.getMinerById = async (req, res) => {
  try {
    const miner = await Miner.findById(req.params.id);
    if (!miner) return res.status(404).json({ success: false, message: 'Miner not found' });

    const history = await SensorData.find({ miner: miner._id }).sort({ timestamp: -1 }).limit(50);
    const alerts = await Alert.find({ miner: miner._id }).sort({ createdAt: -1 }).limit(20);

    res.json({ success: true, data: { miner, history, alerts } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Register a new miner + belt
// @route  POST /api/miners
exports.createMiner = async (req, res) => {
  try {
    const miner = await Miner.create(req.body);
    res.status(201).json({ success: true, data: miner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Update miner details
// @route  PUT /api/miners/:id
exports.updateMiner = async (req, res) => {
  try {
    const miner = await Miner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!miner) return res.status(404).json({ success: false, message: 'Miner not found' });
    res.json({ success: true, data: miner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc   Deactivate / remove a miner (checked out / offline)
// @route  DELETE /api/miners/:id
exports.deactivateMiner = async (req, res) => {
  try {
    const miner = await Miner.findByIdAndUpdate(
      req.params.id,
      { isActive: false, status: 'OFFLINE' },
      { new: true }
    );
    if (!miner) return res.status(404).json({ success: false, message: 'Miner not found' });
    res.json({ success: true, data: miner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
