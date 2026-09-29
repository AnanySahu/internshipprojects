import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, onConfirm, contactName, isDeleting = false }) => {
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

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <AlertTriangle size={20} />
            <h2>Delete Contact</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Are you sure you want to permanently delete <strong>{contactName || 'this contact'}</strong>? This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={isDeleting}>
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
