import { useContext } from 'react';
import { NotificationContext, NotificationType } from '../context/NotificationContext';

interface UseNotificationReturn {
  addNotification: (message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
}

export const useNotification = (): UseNotificationReturn => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  return {
    addNotification: (message: string, type: NotificationType) => {
      context.addNotification({ message, type });
    },
    removeNotification: (id: string) => context.removeNotification(id),
  };
};
