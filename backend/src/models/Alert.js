const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    miner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Miner',
      required: true,
      index: true,
    },
    beltId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'GAS_CO',
        'GAS_CH4',
        'GAS_O2_LOW',
        'FALL_DETECTED',
        'HEART_RATE_ABNORMAL',
        'BODY_TEMP_HIGH',
        'BATTERY_LOW',
        'SOS_MANUAL',
        'DEVICE_OFFLINE',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // the reading that triggered it
    },
    location: {
      lat: Number,
      lng: Number,
      zone: String,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: String,
    },
  },
  { timestamps: true }
);

alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
