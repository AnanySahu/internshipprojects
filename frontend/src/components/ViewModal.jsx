import React, { useEffect } from 'react';
import { X, Mail, Phone, MapPin, Building, Briefcase, Calendar, Edit2 } from 'lucide-react';

const ViewModal = ({ isOpen, onClose, contact, onEdit }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !contact) return null;

  const hasAddress =
    contact.address &&
    (contact.address.street || contact.address.city || contact.address.state || contact.address.pincode);

  const hasCompany =
    contact.company &&
    (contact.company.name || contact.company.jobTitle || contact.company.department);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Contact Details</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '1.5rem' }}>
          {/* Hero Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
              }}
            >
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{contact.name}</h3>
              {contact.company?.jobTitle && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {contact.company.jobTitle}
                  {contact.company.name ? ` at ${contact.company.name}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Quick Communication Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
              <Mail size={18} style={{ color: 'var(--primary)' }} />
              <a href={`mailto:${contact.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {contact.email}
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
              <Phone size={18} style={{ color: 'var(--primary)' }} />
              <a href={`tel:${contact.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {contact.phone}
              </a>
            </div>
          </div>

          {/* Professional Details */}
          {hasCompany && (
            <div>
              <div className="form-section-title">Professional Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.75rem' }}>
                {contact.company?.name && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Company</span>
                    <strong style={{ fontSize: '0.9rem' }}>{contact.company.name}</strong>
                  </div>
                )}
                {contact.company?.jobTitle && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Job Title</span>
                    <strong style={{ fontSize: '0.9rem' }}>{contact.company.jobTitle}</strong>
                  </div>
                )}
                {contact.company?.department && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Department</span>
                    <strong style={{ fontSize: '0.9rem' }}>{contact.company.department}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Address Details */}
          {hasAddress && (
            <div>
              <div className="form-section-title">Address</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.75rem' }}>
                <MapPin size={18} style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }} />
                <div style={{ fontSize: '0.9rem' }}>
                  {contact.address.street && <div>{contact.address.street}</div>}
                  <div>
                    {[contact.address.city, contact.address.state, contact.address.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Created: {new Date(contact.createdAt).toLocaleDateString()}</span>
            {contact.updatedAt && <span>Updated: {new Date(contact.updatedAt).toLocaleDateString()}</span>}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onEdit(contact);
            }}
          >
            <Edit2 size={16} />
            <span>Edit Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
