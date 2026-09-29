const Contact = require('../models/Contact');
const ApiError = require('../utils/apiError');

/**
 * Helper to safely escape special regex characters
 */
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

class ContactService {
  /**
   * Create a new contact for a specific user
   * @param {string} userId - ID of authenticated user
   * @param {Object} contactData - Contact payload
   */
  async createContact(userId, contactData) {
    // Check if user already has a contact with this email
    const existingContact = await Contact.findOne({
      user: userId,
      email: contactData.email.toLowerCase(),
    });

    if (existingContact) {
      throw ApiError.conflict('A contact with this email address already exists in your contact list');
    }

    const contact = await Contact.create({
      ...contactData,
      user: userId,
    });

    return contact;
  }

  /**
   * Get all contacts for a specific user with search, sort, and pagination
   * @param {string} userId - ID of authenticated user
   * @param {Object} queryOptions - { search, sortBy, order, page, limit }
   */
  async getContacts(userId, queryOptions = {}) {
    const {
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = queryOptions;

    // 1. Base filter strictly scoped to the authenticated user
    const filter = { user: userId };

    // 2. Search filter across name, email, or phone
    if (search && search.trim()) {
      const sanitizedSearch = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitizedSearch, 'i');

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    // 3. Sorting configuration (whitelist guarded)
    const allowedSortFields = {
      name: 'name',
      email: 'email',
      company: 'company.name',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    };

    const sortField = allowedSortFields[sortBy] || 'createdAt';
    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
    const sortCriteria = { [sortField]: sortOrder };

    // Add tie-breaker for deterministic pagination
    if (sortField !== '_id') {
      sortCriteria._id = sortOrder;
    }

    // 4. Pagination calculations
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (currentPage - 1) * pageLimit;

    // 5. Execute query and count in parallel using lean() for optimal read performance
    const [contacts, totalContacts] = await Promise.all([
      Contact.find(filter)
        .sort(sortCriteria)
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      Contact.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalContacts / pageLimit) || 1;

    return {
      contacts,
      pagination: {
        currentPage,
        limit: pageLimit,
        totalContacts,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  }

  /**
   * Get single contact by ID ensuring user ownership
   * @param {string} userId - ID of authenticated user
   * @param {string} contactId - Contact ID
   */
  async getContactById(userId, contactId) {
    const contact = await Contact.findOne({ _id: contactId, user: userId }).lean();

    if (!contact) {
      throw ApiError.notFound('Contact not found');
    }

    return contact;
  }

  /**
   * Update contact by ID ensuring user ownership
   * @param {string} userId - ID of authenticated user
   * @param {string} contactId - Contact ID
   * @param {Object} updateData - Data to update
   */
  async updateContact(userId, contactId, updateData) {
    const contact = await Contact.findOne({ _id: contactId, user: userId });

    if (!contact) {
      throw ApiError.notFound('Contact not found');
    }

    // Check duplicate email if email is being updated
    if (updateData.email && updateData.email.toLowerCase() !== contact.email) {
      const duplicate = await Contact.findOne({
        user: userId,
        email: updateData.email.toLowerCase(),
        _id: { $ne: contactId },
      });

      if (duplicate) {
        throw ApiError.conflict('Another contact with this email already exists in your contact list');
      }
      contact.email = updateData.email.toLowerCase();
    }

    if (updateData.name) contact.name = updateData.name;
    if (updateData.phone) contact.phone = updateData.phone;

    // Handle nested address updates
    if (updateData.address) {
      contact.address = {
        ...contact.address.toObject(),
        ...updateData.address,
      };
    }

    // Handle nested company updates
    if (updateData.company) {
      contact.company = {
        ...contact.company.toObject(),
        ...updateData.company,
      };
    }

    await contact.save();
    return contact;
  }

  /**
   * Delete contact by ID ensuring user ownership
   * @param {string} userId - ID of authenticated user
   * @param {string} contactId - Contact ID
   */
  async deleteContact(userId, contactId) {
    const contact = await Contact.findOneAndDelete({ _id: contactId, user: userId });

    if (!contact) {
      throw ApiError.notFound('Contact not found');
    }

    return { id: contact._id };
  }
}

module.exports = new ContactService();
