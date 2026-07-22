const mongoose = require('mongoose');

const minerSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    beltId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    designation: {
      type: String,
      default: 'Mine Worker',
    },
    shift: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Night'],
      default: 'Morning',
    },
    zone: {
      type: String,
      default: 'Zone A - Main Shaft',
    },
    contactNumber: {
      type: String,
      default: 'N/A',
    },
    emergencyContact: {
      type: String,
      default: 'N/A',
    },
    status: {
      type: String,
      enum: ['SAFE', 'WARNING', 'CRITICAL', 'OFFLINE'],
      default: 'SAFE',
    },
    isActive: {
      type: Boolean,
      default: true, // currently checked-in / belt powered on
    },
    photoUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Miner', minerSchema);
