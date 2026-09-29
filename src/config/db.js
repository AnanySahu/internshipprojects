const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry & event monitoring
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/contact_management';

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true, // Build indexes in dev/testing; can disable in heavy production
      driverInfo: { name: 'nodejs', version: '1.0.0' },
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('[Database] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] Lost MongoDB connection');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] Reconnected to MongoDB');
    });

    return conn;
  } catch (error) {
    console.error(`[Database] Initial connection error: ${error.message}`);
    // If not in test environment, exit process on database connection failure
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Gracefully close database connection
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] Connection closed gracefully');
  } catch (err) {
    console.error('[Database] Error closing connection:', err.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
