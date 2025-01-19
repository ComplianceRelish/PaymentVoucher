import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { NotificationType } from '../context/NotificationContext';

interface NotificationToastProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`${getBackgroundColor()} border rounded-lg p-4 flex items-center justify-between`}
      role="alert"
    >
      <div className="flex items-center">
        {getIcon()}
        <span className="ml-3 text-sm font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 focus:outline-none hover:opacity-80"
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default NotificationToast;
