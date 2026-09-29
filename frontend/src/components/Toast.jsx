import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${type === 'error' ? 'toast-error' : 'toast-success'}`} role="alert">
        {type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
        <span style={{ flex: 1 }}>{message}</span>
        <button
          onClick={onClose}
          style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
