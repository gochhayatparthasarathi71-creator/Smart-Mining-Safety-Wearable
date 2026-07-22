const express = require('express');
const router = express.Router();
const { ingestReading, triggerSOS, getHistory } = require('../controllers/sensorController');

router.post('/ingest', ingestReading);
router.post('/sos', triggerSOS);
router.get('/:minerId/history', getHistory);

module.exports = router;
