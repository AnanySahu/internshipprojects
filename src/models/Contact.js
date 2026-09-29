const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const companySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    jobTitle: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/,
        'Please provide a valid phone number (e.g. +1234567890 or 9876543210)',
      ],
    },
    address: {
      type: addressSchema,
      default: () => ({}),
    },
    company: {
      type: companySchema,
      default: () => ({}),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contact must be associated with a user'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index: A user cannot create duplicate contacts with the exact same email
contactSchema.index({ user: 1, email: 1 }, { unique: true });

// Performance indexes for search, sort, and pagination scoped to the user
contactSchema.index({ user: 1, name: 1 });
contactSchema.index({ user: 1, phone: 1 });
contactSchema.index({ user: 1, createdAt: -1 });
contactSchema.index({ user: 1, 'company.name': 1 });

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
