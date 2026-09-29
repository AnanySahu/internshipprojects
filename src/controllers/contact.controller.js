const contactService = require('../services/contact.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new contact
 * @route   POST /api/contacts
 * @access  Private
 */
const createContact = asyncHandler(async (req, res) => {
  const contact = await contactService.createContact(req.user._id, req.body);
  return ApiResponse.created(res, 'Contact created successfully', contact);
});

/**
 * @desc    Get all contacts for current user (supports search, sort, pagination)
 * @route   GET /api/contacts
 * @access  Private
 */
const getContacts = asyncHandler(async (req, res) => {
  const result = await contactService.getContacts(req.user._id, req.query);
  return ApiResponse.success(res, 'Contacts retrieved successfully', result);
});

/**
 * @desc    Get single contact by ID
 * @route   GET /api/contacts/:id
 * @access  Private
 */
const getContactById = asyncHandler(async (req, res) => {
  const contact = await contactService.getContactById(req.user._id, req.params.id);
  return ApiResponse.success(res, 'Contact retrieved successfully', contact);
});

/**
 * @desc    Update a contact by ID
 * @route   PATCH /api/contacts/:id
 * @access  Private
 */
const updateContact = asyncHandler(async (req, res) => {
  const contact = await contactService.updateContact(req.user._id, req.params.id, req.body);
  return ApiResponse.success(res, 'Contact updated successfully', contact);
});

/**
 * @desc    Delete a contact by ID
 * @route   DELETE /api/contacts/:id
 * @access  Private
 */
const deleteContact = asyncHandler(async (req, res) => {
  const result = await contactService.deleteContact(req.user._id, req.params.id);
  return ApiResponse.success(res, 'Contact deleted successfully', result);
});

module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
};
