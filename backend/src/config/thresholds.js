// Central place for all safety threshold values.
// Pulled from .env with sane fallbacks so the app still runs out-of-the-box.

module.exports = {
  CO_PPM: Number(process.env.THRESHOLD_CO_PPM) || 50,           // Carbon Monoxide (ppm) - danger above this
  CH4_PERCENT: Number(process.env.THRESHOLD_CH4_PERCENT) || 1.0, // Methane (%LEL) - danger above this
  O2_MIN_PERCENT: Number(process.env.THRESHOLD_O2_MIN_PERCENT) || 19.5, // Oxygen (%) - danger below this
  HEART_RATE_MIN: Number(process.env.THRESHOLD_HEART_RATE_MIN) || 50,
  HEART_RATE_MAX: Number(process.env.THRESHOLD_HEART_RATE_MAX) || 150,
  BODY_TEMP_MAX: Number(process.env.THRESHOLD_BODY_TEMP_MAX) || 38.5,
  BATTERY_LOW: Number(process.env.THRESHOLD_BATTERY_LOW) || 15,
};
