const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contact.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const {
  createContactValidator,
  updateContactValidator,
  contactIdValidator,
  contactQueryValidator,
} = require('../validators/contact.validator');

// All contact routes require valid authentication
router.use(authenticate);

router
  .route('/')
  .post(validate(createContactValidator), contactController.createContact)
  .get(validate(contactQueryValidator), contactController.getContacts);

router
  .route('/:id')
  .get(validate(contactIdValidator), contactController.getContactById)
  .patch(validate(updateContactValidator), contactController.updateContact)
  .delete(validate(contactIdValidator), contactController.deleteContact);

module.exports = router;
