import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

function Toast({ message, type = 'success', onClose }) {
  // Auto-dismiss after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 max-w-sm">
        {isSuccess ? (
          <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
        )}

        <p className="text-gray-700 text-sm flex-1 leading-snug">{message}</p>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default Toast;
