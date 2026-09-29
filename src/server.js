require('dotenv').config();

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

let server;

// Handle uncaught exceptions before server starts
process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Connect to MongoDB and start HTTP listener
const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Contact Management API running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(` Server Port: http://localhost:${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('[Server] Failed to initialize server:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Process] Unhandled Rejection:', err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown signals
const gracefulShutdown = async (signal) => {
  console.log(`\n[Process] Received ${signal}. Gracefully shutting down...`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
