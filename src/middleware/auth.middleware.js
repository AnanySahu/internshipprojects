const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');

/**
 * JWT Authentication Middleware
 * Protects routes by verifying the Bearer token in Authorization header
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access denied. Authentication token is missing or malformed.');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw ApiError.unauthorized('Access denied. Token not found.');
  }

  // verifyToken will throw JsonWebTokenError/TokenExpiredError if invalid,
  // which will be handled gracefully by centralized error middleware
  const decoded = verifyToken(token);

  const currentUser = await User.findById(decoded.id).select('-password');
  if (!currentUser) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists.');
  }

  // Attach user object to request
  req.user = currentUser;
  next();
});

module.exports = authenticate;
