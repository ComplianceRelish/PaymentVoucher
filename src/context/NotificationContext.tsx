import React, { createContext, useState, useCallback } from 'react';
import { NOTIFICATION_TIMEOUT } from './notificationConstants';

type NotificationType = 'info' | 'success' | 'error' | 'otp';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const duration = notification.duration || (notification.type === 'otp' ? 30000 : NOTIFICATION_TIMEOUT);

    setNotifications(prev => [...prev, { ...notification, id }]);

    if (duration) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`mb-4 p-4 rounded shadow-lg transition-all transform ${
              notification.type === 'success'
                ? 'bg-green-500'
                : notification.type === 'error'
                ? 'bg-red-500'
                : notification.type === 'otp'
                ? 'bg-purple-500'
                : 'bg-blue-500'
            } text-white`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
