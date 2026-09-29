const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const contactRoutes = require('./routes/contact.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// 1. Security & HTTP Header hardening
app.use(helmet());

// 2. CORS setup
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 3. Request body parsers with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Request logging (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 5. Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Contact Management API is operational',
    timestamp: new Date().toISOString(),
  });
});

// 6. Application API routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);

// 7. 404 Catch-all handler for unknown endpoints
app.use(notFoundHandler);

// 8. Centralized operational error handling middleware
app.use(errorHandler);

module.exports = app;
