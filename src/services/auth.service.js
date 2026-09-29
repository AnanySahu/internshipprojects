const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { generateToken } = require('../utils/jwt');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   */
  async register({ name, email, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('A user with this email address already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken({ id: user._id, email: user.email });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Authenticate user & generate JWT
   * @param {Object} credentials - { email, password }
   */
  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = generateToken({ id: user._id, email: user.email });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Retrieve user profile by ID
   * @param {string} userId
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId).select('-__v');
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }
    return user;
  }
}

module.exports = new AuthService();
