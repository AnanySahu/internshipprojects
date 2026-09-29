const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {Object} payload - Data to embed in the token (e.g. { id, email })
 * @param {string} expiresIn - Expiry timeframe (e.g. '7d', '24h')
 * @returns {string} Signed JWT
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - Bearer token to verify
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken,
};
