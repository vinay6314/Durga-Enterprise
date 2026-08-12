import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
          title="Click to dismiss"
        >
          {toast.type === 'success' && <CheckCircle2 size={18} style={{ flexShrink: 0 }} />}
          {toast.type === 'error' && <AlertCircle size={18} style={{ flexShrink: 0 }} />}
          {toast.type === 'info' && <Info size={18} style={{ flexShrink: 0 }} />}
          <span style={{ flex: 1, wordBreak: 'break-word' }}>{toast.message}</span>
          <X size={16} style={{ flexShrink: 0, opacity: 0.85, cursor: 'pointer' }} />
        </div>
      ))}
    </div>
  );
};
