const express = require('express');
const router = express.Router();
const { getAlerts, resolveAlert, getStats } = require('../controllers/alertController');

router.get('/', getAlerts);
router.get('/stats', getStats);
router.patch('/:id/resolve', resolveAlert);

module.exports = router;
