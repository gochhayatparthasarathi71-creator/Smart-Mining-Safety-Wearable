const Alert = require('../models/Alert');

// @desc   Get alerts (optionally filter by resolved status)
// @route  GET /api/alerts?resolved=false&limit=50
exports.getAlerts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.resolved !== undefined) filter.resolved = req.query.resolved === 'true';

    const limit = Number(req.query.limit) || 100;
    const alerts = await Alert.find(filter)
      .populate('miner', 'name employeeId beltId zone')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Mark an alert as resolved
// @route  PATCH /api/alerts/:id/resolve
exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedAt: new Date(), resolvedBy: req.body.resolvedBy || 'Control Room' },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    const io = req.app.get('io');
    if (io) io.emit('alert:resolved', alert);

    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Dashboard summary stats
// @route  GET /api/alerts/stats
exports.getStats = async (req, res) => {
  try {
    const [total, unresolved, critical] = await Promise.all([
      Alert.countDocuments(),
      Alert.countDocuments({ resolved: false }),
      Alert.countDocuments({ resolved: false, severity: 'CRITICAL' }),
    ]);

    const last24h = await Alert.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    res.json({ success: true, data: { total, unresolved, critical, last24h } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
