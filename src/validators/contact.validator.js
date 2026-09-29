const { body, param, query } = require('express-validator');

// Validation for contact creation
const createContactValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Contact name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/)
    .withMessage('Please provide a valid phone number (e.g. +1234567890 or 9876543210)'),

  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.pincode').optional().trim(),

  body('company.name').optional().trim(),
  body('company.jobTitle').optional().trim(),
  body('company.department').optional().trim(),
];

// Validation for contact update (PATCH - fields are optional)
const updateContactValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid contact ID format'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/)
    .withMessage('Please provide a valid phone number (e.g. +1234567890 or 9876543210)'),

  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.pincode').optional().trim(),

  body('company.name').optional().trim(),
  body('company.jobTitle').optional().trim(),
  body('company.department').optional().trim(),
];

// Validation for contact ID param in GET / DELETE
const contactIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid contact ID format'),
];

// Validation for query params in GET /api/contacts
const contactQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer starting from 1')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'company', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field. Allowed fields: name, email, company, createdAt, updatedAt'),

  query('order')
    .optional()
    .toLowerCase()
    .isIn(['asc', 'desc'])
    .withMessage("Sort order must be either 'asc' or 'desc'"),

  query('search')
    .optional()
    .trim(),
];

module.exports = {
  createContactValidator,
  updateContactValidator,
  contactIdValidator,
  contactQueryValidator,
};
