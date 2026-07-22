const express = require('express');
const router = express.Router();
const {
  getAllMiners,
  getMinerById,
  createMiner,
  updateMiner,
  deactivateMiner,
} = require('../controllers/minerController');

router.get('/', getAllMiners);
router.get('/:id', getMinerById);
router.post('/', createMiner);
router.put('/:id', updateMiner);
router.delete('/:id', deactivateMiner);

module.exports = router;
