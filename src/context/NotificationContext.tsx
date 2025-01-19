import React, { createContext, useState, useCallback } from 'react';

const NOTIFICATION_TIMEOUT = 5000; // 5 seconds

export type NotificationType = 'info' | 'success' | 'error';

export interface Notification {
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (index: number) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [...prev, notification]);

    const timeout = notification.duration || NOTIFICATION_TIMEOUT;
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== notification));
    }, timeout);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className={`mb-4 p-4 rounded shadow-lg transition-all transform ${
              notification.type === 'success'
                ? 'bg-green-500'
                : notification.type === 'error'
                ? 'bg-red-500'
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
