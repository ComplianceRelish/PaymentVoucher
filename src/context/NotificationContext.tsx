import React, { createContext, useContext, useState, useCallback } from 'react';
import { OTPNotification } from '../lib/otpService';

type NotificationType = 'info' | 'success' | 'error' | 'otp';

interface BaseNotification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

type Notification = BaseNotification | (BaseNotification & OTPNotification);

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const duration = notification.duration || (notification.type === 'otp' ? 30000 : 5000);

    setNotifications(prev => [...prev, { ...notification, id }]);

    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
