require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Miner = require('../models/Miner');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const User = require('../models/User');

const demoMiners = [
  {
    employeeId: 'EMP-1001',
    name: 'Ramesh Sahu',
    beltId: 'BELT-A1',
    designation: 'Drilling Operator',
    shift: 'Morning',
    zone: 'Zone A - Main Shaft',
    contactNumber: '9876543210',
    emergencyContact: '9876500001',
  },
  {
    employeeId: 'EMP-1002',
    name: 'Suresh Nayak',
    beltId: 'BELT-A2',
    designation: 'Blasting Technician',
    shift: 'Morning',
    zone: 'Zone B - Coal Face 2',
    contactNumber: '9876543211',
    emergencyContact: '9876500002',
  },
  {
    employeeId: 'EMP-1003',
    name: 'Manoj Behera',
    beltId: 'BELT-A3',
    designation: 'Haulage Operator',
    shift: 'Afternoon',
    zone: 'Zone D - Haulage Tunnel',
    contactNumber: '9876543212',
    emergencyContact: '9876500003',
  },
  {
    employeeId: 'EMP-1004',
    name: 'Ajit Pradhan',
    beltId: 'BELT-A4',
    designation: 'Ventilation Inspector',
    shift: 'Morning',
    zone: 'Zone C - Ventilation Duct',
    contactNumber: '9876543213',
    emergencyContact: '9876500004',
  },
  {
    employeeId: 'EMP-1005',
    name: 'Bijay Mallick',
    beltId: 'BELT-A5',
    designation: 'Mine Supervisor',
    shift: 'Night',
    zone: 'Zone A - Main Shaft',
    contactNumber: '9876543214',
    emergencyContact: '9876500005',
  },
  {
    employeeId: 'EMP-1006',
    name: 'Deepak Rout',
    beltId: 'BELT-A6',
    designation: 'Loader Operator',
    shift: 'Afternoon',
    zone: 'Zone B - Coal Face 2',
    contactNumber: '9876543215',
    emergencyContact: '9876500006',
  },
];

async function seed() {
  await connectDB();

  console.log('🧹 Clearing existing demo data...');
  await Promise.all([Miner.deleteMany({}), SensorData.deleteMany({}), Alert.deleteMany({})]);

  console.log('🌱 Seeding miners...');
  await Miner.insertMany(demoMiners);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@safetybelt.com';
  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    console.log('👤 Creating default control-room admin account...');
    await User.create({
      name: 'Control Room Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'ADMIN',
    });
  }

  console.log('✅ Seed complete!');
  console.log(`   ${demoMiners.length} miners created.`);
  console.log(`   Login with: ${adminEmail} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
