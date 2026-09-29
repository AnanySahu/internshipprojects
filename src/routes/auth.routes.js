const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

// Public routes
router.post('/register', validate(registerValidator), authController.register);
router.post('/login', validate(loginValidator), authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);

module.exports = router;
