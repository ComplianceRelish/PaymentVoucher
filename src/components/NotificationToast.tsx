import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'otp' | 'info';
  message: string;
  otp?: string;
}

const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'otp':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'otp':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const isOTPNotification = (notification: Notification): notification is Notification & { type: 'otp'; otp: string } => {
    return notification.type === 'otp' && 'otp' in notification;
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {notifications.map((notification: Notification) => (
        <div
          key={notification.id}
          className={`flex items-center p-4 rounded-lg shadow-lg border ${getBackgroundColor(
            notification.type
          )} min-w-[300px]`}
        >
          <div className="flex-shrink-0">{getIcon(notification.type)}</div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {notification.message}
              {isOTPNotification(notification) && (
                <span className="ml-2 font-bold text-blue-600">{notification.otp}</span>
              )}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
