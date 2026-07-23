const express = require('express');
const router = express.Router();

// TEST ROUTE
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: "Auth route is working!"
  });
});

const { login, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, me);

module.exports = router;
