import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    pincode: '',
  },
  company: {
    name: '',
    jobTitle: '',
    department: '',
  },
};

const ContactModal = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          pincode: initialData.address?.pincode || '',
        },
        company: {
          name: initialData.company?.name || '',
          jobTitle: initialData.company?.jobTitle || '',
          department: initialData.company?.department || '',
        },
      });
    } else {
      setFormData(initialFormData);
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else if (name.startsWith('company.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        company: { ...prev.company, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Frontend quick validation
    if (!formData.name.trim()) {
      setErrorMessage('Contact name is required');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Email address is required');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Phone number is required');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save contact');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? 'Edit Contact' : 'Create New Contact'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="modal-body">
            {errorMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--danger-light)',
                  color: 'var(--danger)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Basic Info */}
            <div className="form-grid">
              <div className="form-group form-full">
                <label htmlFor="contact-name">
                  Full Name <span>*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  placeholder="e.g. Sarah Connor"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">
                  Email Address <span>*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="sarah@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-phone">
                  Phone Number <span>*</span>
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 234-5678"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Professional Info */}
            <div className="form-section-title">Professional Information</div>
            <div className="form-grid">
              <div className="form-group form-full">
                <label htmlFor="company-name">Company Name</label>
                <input
                  id="company-name"
                  type="text"
                  name="company.name"
                  placeholder="e.g. Cyberdyne Systems"
                  value={formData.company.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="company-jobTitle">Job Title</label>
                <input
                  id="company-jobTitle"
                  type="text"
                  name="company.jobTitle"
                  placeholder="e.g. Security Specialist"
                  value={formData.company.jobTitle}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="company-department">Department</label>
                <input
                  id="company-department"
                  type="text"
                  name="company.department"
                  placeholder="e.g. Operations"
                  value={formData.company.department}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Address */}
            <div className="form-section-title">Address Details</div>
            <div className="form-grid">
              <div className="form-group form-full">
                <label htmlFor="address-street">Street Address</label>
                <input
                  id="address-street"
                  type="text"
                  name="address.street"
                  placeholder="e.g. 100 Main Street, Apt 4B"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address-city">City</label>
                <input
                  id="address-city"
                  type="text"
                  name="address.city"
                  placeholder="e.g. Los Angeles"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address-state">State / Province</label>
                <input
                  id="address-state"
                  type="text"
                  name="address.state"
                  placeholder="e.g. California"
                  value={formData.address.state}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address-pincode">Pincode / ZIP</label>
                <input
                  id="address-pincode"
                  type="text"
                  name="address.pincode"
                  placeholder="e.g. 90001"
                  value={formData.address.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Save size={16} />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Contact' : 'Create Contact'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
