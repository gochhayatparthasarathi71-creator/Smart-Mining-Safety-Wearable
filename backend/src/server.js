require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const socketHandler = require('./sockets/socketHandler');
const { startSimulation } = require('./services/simulator');

const authRoutes = require('./routes/authRoutes');
const minerRoutes = require('./routes/minerRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();
const server = http.createServer(app);

// --- Socket.io setup ---
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});
app.set('io', io); // accessible inside controllers via req.app.get('io')
socketHandler(io);

// --- Middleware ---
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

// --- Health check ---
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '⛏️  Smart Mining Safety Belt API is running',
    timestamp: new Date().toISOString(),
  });
});
app.get('/api/health', (req, res) => res.json({ success: true, status: 'OK' }));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/miners', minerRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// --- Error handler (must be last) ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log('=======================================================');
    console.log(`  ⛏️  Smart Mining Safety Belt API`);
    console.log(`  🚀 Server running on http://localhost:${PORT}`);
    console.log(`  🔌 Socket.io ready for real-time connections`);
    console.log('=======================================================');
    startSimulation(io);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});
