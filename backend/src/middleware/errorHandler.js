// Centralized error handler - keeps controllers clean
module.exports = (err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
