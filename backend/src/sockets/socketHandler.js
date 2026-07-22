/**
 * Socket.io event wiring. Real-time events emitted from controllers/simulator:
 *  - sensor:update   -> { miner, reading }   fired on every new reading
 *  - alert:new       -> Alert document       fired when a threshold is breached
 *  - alert:resolved  -> Alert document       fired when control room resolves an alert
 *  - sos:triggered   -> { miner, alert }     fired on manual SOS
 */
module.exports = function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.emit('connected', { message: 'Connected to Smart Mining Safety Belt real-time feed' });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};
