const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema(
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
    gas: {
      co: { type: Number, default: 0 },     // ppm
      ch4: { type: Number, default: 0 },    // % LEL
      o2: { type: Number, default: 20.9 },  // %
    },
    heartRate: {
      type: Number, // bpm
      default: 75,
    },
    bodyTemperature: {
      type: Number, // Celsius
      default: 36.6,
    },
    fallDetected: {
      type: Boolean,
      default: false,
    },
    posture: {
      type: String,
      enum: ['UPRIGHT', 'BENT', 'LYING', 'UNKNOWN'],
      default: 'UPRIGHT',
    },
    batteryLevel: {
      type: Number, // %
      default: 100,
    },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      depth: { type: Number, default: 0 }, // meters below surface
      zone: { type: String, default: 'Zone A - Main Shaft' },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Fast lookup of latest reading per miner
sensorDataSchema.index({ miner: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
